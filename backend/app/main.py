# ============================================================
# BrainSpark Backend - FastAPI Application
# File: app/main.py
# ============================================================

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timedelta
from enum import Enum
import httpx
import os
import jwt
import redis
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, JSON, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from passlib.context import CryptContext
import uuid
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ============================================================
# Configuration
# ============================================================

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/brainspark")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    GROK_API_KEY: str = os.getenv("GROK_API_KEY", "")
    DEFAULT_AI_MODEL: str = os.getenv("DEFAULT_AI_MODEL", "claude")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24

settings = Settings()

# ============================================================
# Database Models
# ============================================================

Base = declarative_base()
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class AgeGroup(str, Enum):
    CUBS = "cubs"           # 4-6 years
    EXPLORERS = "explorers" # 7-10 years
    MASTERS = "masters"     # 11-14 years

class AIModel(str, Enum):
    CLAUDE = "claude"
    GROK = "grok"

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, default="parent")  # parent or child
    parent_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    children = relationship("User", backref="parent", remote_side=[id])
    child_profile = relationship("ChildProfile", back_populates="user", uselist=False)

class ChildProfile(Base):
    __tablename__ = "child_profiles"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    age_group = Column(String, default=AgeGroup.EXPLORERS.value)
    avatar = Column(String, default="🧒")
    stars = Column(Integer, default=0)
    streak = Column(Integer, default=0)
    last_active = Column(DateTime, default=datetime.utcnow)
    total_questions = Column(Integer, default=0)
    achievements = Column(JSON, default=list)
    
    user = relationship("User", back_populates="child_profile")
    topic_progress = relationship("TopicProgress", back_populates="child")
    conversations = relationship("Conversation", back_populates="child")

class TopicProgress(Base):
    __tablename__ = "topic_progress"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    child_id = Column(String, ForeignKey("child_profiles.id"))
    topic = Column(String, nullable=False)  # Space, Physics, Nature, etc.
    level = Column(Integer, default=1)
    questions_asked = Column(Integer, default=0)
    max_depth_reached = Column(Integer, default=0)
    unlocked = Column(Boolean, default=False)
    last_visited = Column(DateTime, default=datetime.utcnow)
    
    child = relationship("ChildProfile", back_populates="topic_progress")

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    child_id = Column(String, ForeignKey("child_profiles.id"))
    topic = Column(String, nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    depth_reached = Column(Integer, default=0)
    messages = Column(JSON, default=list)
    
    child = relationship("ChildProfile", back_populates="conversations")

class DailyActivity(Base):
    __tablename__ = "daily_activity"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    child_id = Column(String, ForeignKey("child_profiles.id"))
    date = Column(DateTime, default=datetime.utcnow)
    questions_asked = Column(Integer, default=0)
    stars_earned = Column(Integer, default=0)
    topics_explored = Column(JSON, default=list)
    max_depth = Column(Integer, default=0)

# ============================================================
# Pydantic Schemas
# ============================================================

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    role: str = "parent"

class ChildCreate(BaseModel):
    name: str
    age_group: AgeGroup
    avatar: str = "🧒"

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    topic: str
    message: str
    conversation_id: Optional[str] = None
    age_group: AgeGroup
    preferred_model: Optional[AIModel] = None
    enable_fallback: bool = True

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    depth: int
    stars_earned: int
    achievement: Optional[str] = None
    model_used: str = "unknown"

class ChildStats(BaseModel):
    stars: int
    streak: int
    total_questions: int
    achievements: List[str]
    topics: dict
    weekly_activity: List[int]

# ============================================================
# FastAPI Application
# ============================================================

app = FastAPI(
    title="BrainSpark API",
    description="AI-powered learning companion for curious kids",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Redis for caching (optional - lazy connection)
redis_client = None
try:
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    redis_client.ping()  # Test connection
except Exception as e:
    print(f"Warning: Redis not available: {e}. Caching disabled.")
    redis_client = None

# ============================================================
# Dependencies
# ============================================================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def create_token(user_id: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

# ============================================================
# AI Engine - Multi-Model Integration (Claude & Grok)
# ============================================================

AGE_GROUP_PROMPTS = {
    AgeGroup.CUBS: """You are talking to a 4-6 year old child. Use very simple words, short sentences,
    lots of emojis, and make everything feel magical and fun. Ask one simple question at a time.
    Be extremely encouraging and celebrate their curiosity.""",

    AgeGroup.EXPLORERS: """You are talking to a 7-10 year old child. Use adventure metaphors,
    exciting examples, and build on their curiosity. Challenge them slightly but keep it fun.
    Use analogies they can relate to from everyday life.""",

    AgeGroup.MASTERS: """You are talking to an 11-14 year old. Engage them with deeper questions,
    introduce philosophical concepts, encourage critical thinking. Treat them as capable of
    handling complex ideas while keeping the wonder alive."""
}

def build_system_prompt(topic: str, age_group: AgeGroup, depth: int) -> str:
    """Build the system prompt for AI models"""
    return f"""You are BrainSpark, an AI companion designed to spark curiosity and deep thinking in children.

CURRENT CONTEXT:
- Age Group: {age_group.value}
- Topic: {topic}
- Conversation Depth: {depth} questions deep

YOUR PERSONALITY:
{AGE_GROUP_PROMPTS[age_group]}

RULES:
1. Always end with a thought-provoking question that goes DEEPER into the topic
2. Use the "Why Chain" technique - each answer should open new doors of curiosity
3. Celebrate their thinking with genuine enthusiasm
4. If they give a wrong answer, guide them gently
5. Connect concepts to things they already know
6. Keep responses concise (2-3 short paragraphs max)
7. Use relevant emojis naturally
8. Never be condescending

RESPONSE FORMAT:
- Address their thought/question
- Add one fascinating fact or insight
- End with a deeper follow-up question"""

async def call_claude_api(
    system_prompt: str,
    messages: List[dict],
    timeout: float = 30.0
) -> tuple[str, bool]:
    """Call Claude API. Returns (response_text, success)"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": settings.ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01"
                },
                json={
                    "model": "claude-sonnet-4-20250514",
                    "max_tokens": 1000,
                    "system": system_prompt,
                    "messages": messages
                },
                timeout=timeout
            )
            response.raise_for_status()
            data = response.json()
            return data["content"][0]["text"], True
    except Exception as e:
        print(f"Claude API Error: {e}")
        return "", False

async def call_grok_api(
    system_prompt: str,
    messages: List[dict],
    timeout: float = 30.0
) -> tuple[str, bool]:
    """Call Grok API. Returns (response_text, success)"""
    try:
        # Prepare messages in OpenAI format (Grok uses OpenAI-compatible API)
        grok_messages = [{"role": "system", "content": system_prompt}]
        grok_messages.extend(messages)

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.x.ai/v1/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {settings.GROK_API_KEY}"
                },
                json={
                    "model": "grok-2-latest",
                    "messages": grok_messages,
                    "max_tokens": 1000,
                    "temperature": 0.7
                },
                timeout=timeout
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"], True
    except Exception as e:
        print(f"Grok API Error: {e}")
        return "", False

async def get_ai_response(
    topic: str,
    message: str,
    age_group: AgeGroup,
    conversation_history: List[dict],
    depth: int,
    preferred_model: Optional[AIModel] = None,
    enable_fallback: bool = True
) -> tuple[str, str]:
    """Generate AI response with multi-model support and failover.
    Returns (response_text, model_used)"""

    system_prompt = build_system_prompt(topic, age_group, depth)
    messages = [{"role": m["role"], "content": m["content"]} for m in conversation_history]
    messages.append({"role": "user", "content": message})

    # Determine primary and fallback models
    if preferred_model:
        primary_model = preferred_model
    else:
        primary_model = AIModel.CLAUDE if settings.DEFAULT_AI_MODEL == "claude" else AIModel.GROK

    # Try primary model
    response_text = ""
    model_used = "fallback"

    if primary_model == AIModel.CLAUDE:
        response_text, success = await call_claude_api(system_prompt, messages)
        if success:
            return response_text, "claude"
        elif enable_fallback:
            print("Claude failed, trying Grok as fallback...")
            response_text, success = await call_grok_api(system_prompt, messages)
            if success:
                return response_text, "grok"
    else:  # GROK
        response_text, success = await call_grok_api(system_prompt, messages)
        if success:
            return response_text, "grok"
        elif enable_fallback:
            print("Grok failed, trying Claude as fallback...")
            response_text, success = await call_claude_api(system_prompt, messages)
            if success:
                return response_text, "claude"

    # If both APIs fail, return static fallback
    return get_fallback_response(topic), "fallback"

def get_fallback_response(topic: str) -> str:
    """Fallback responses when API fails"""
    fallbacks = {
        "Space": "🌌 Did you know there are more stars than grains of sand on Earth? What do you think is out there?",
        "Physics": "⚛️ Everything around you is made of tiny atoms! What would you do if you could shrink to atom size?",
        "Nature": "🌿 Plants can actually communicate underground! What do you think they talk about?",
        "Math": "🔢 Math is like a secret code! Ready to solve a mystery with numbers?",
        "Animals": "🦁 Some animals have superpowers humans don't! Which animal ability would you want?",
        "Music": "🎵 Music is just vibrations in the air - but it makes us feel so much! Why do you think that is?",
        "History": "🏛️ People from the past were just like us, but lived so differently! What would surprise them about today?",
        "Ocean": "🌊 We've explored more of space than our own oceans! What creatures might be hiding in the deep?"
    }
    return fallbacks.get(topic, "That's a fascinating thought! Tell me more about what you're thinking...")

# ============================================================
# API Endpoints - Authentication
# ============================================================

@app.post("/api/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new parent account"""
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_data.email,
        hashed_password=pwd_context.hash(user_data.password),
        name=user_data.name,
        role=user_data.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_token(user.id, user.role)
    return TokenResponse(access_token=token, user_id=user.id, role=user.role)

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """Login with email and password"""
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not pwd_context.verify(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user.id, user.role)
    return TokenResponse(access_token=token, user_id=user.id, role=user.role)

# ============================================================
# API Endpoints - Child Management
# ============================================================

@app.post("/api/children", status_code=201)
async def create_child(
    child_data: ChildCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_token)
):
    """Create a child profile under parent account"""
    child_user = User(
        email=f"child_{uuid.uuid4().hex[:8]}@brainspark.local",
        hashed_password=pwd_context.hash(uuid.uuid4().hex),
        name=child_data.name,
        role="child",
        parent_id=current_user["user_id"]
    )
    db.add(child_user)
    db.flush()
    
    profile = ChildProfile(
        user_id=child_user.id,
        age_group=child_data.age_group.value,
        avatar=child_data.avatar
    )
    db.add(profile)
    
    # Initialize default topics
    default_topics = ["Space", "Physics", "Nature", "Math"]
    for topic in default_topics:
        tp = TopicProgress(child_id=profile.id, topic=topic, unlocked=True)
        db.add(tp)
    
    db.commit()

    # Generate token for child (for testing/development)
    child_token = create_token(child_user.id, child_user.role)

    return {
        "message": "Child profile created",
        "child_id": child_user.id,
        "child_token": child_token  # Include token for easy access
    }

@app.get("/api/children")
async def get_children(
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_token)
):
    """Get all children for current parent"""
    children = db.query(User).filter(User.parent_id == current_user["user_id"]).all()
    return [{
        "id": c.id,
        "name": c.name,
        "profile": {
            "age_group": c.child_profile.age_group if c.child_profile else None,
            "stars": c.child_profile.stars if c.child_profile else 0,
            "streak": c.child_profile.streak if c.child_profile else 0
        } if c.child_profile else None
    } for c in children]

# ============================================================
# API Endpoints - Chat & Learning
# ============================================================

def get_optional_token(credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False))):
    """Optional authentication - returns user if token exists, None otherwise"""
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except:
        return None

@app.post("/api/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_optional_token)
):
    """Send a message and get AI response (works for both authenticated and guest users)"""

    # Get or create conversation
    conversation = None
    child_profile = None

    if request.conversation_id:
        conversation = db.query(Conversation).filter(Conversation.id == request.conversation_id).first()
    elif current_user:
        # Authenticated user - get child profile
        user = db.query(User).filter(User.id == current_user["user_id"]).first()
        child_profile = user.child_profile if user and user.role == "child" else None

        if child_profile:
            conversation = Conversation(
                child_id=child_profile.id,
                topic=request.topic,
                messages=[]
            )
            db.add(conversation)
            db.flush()

    # For guest users or when no conversation, use in-memory tracking
    history = conversation.messages if conversation else []
    depth = len([m for m in history if m.get("role") == "user"])

    ai_response, model_used = await get_ai_response(
        topic=request.topic,
        message=request.message,
        age_group=request.age_group,
        conversation_history=history,
        depth=depth,
        preferred_model=request.preferred_model,
        enable_fallback=request.enable_fallback
    )

    # Update conversation if exists
    if conversation:
        new_messages = history + [
            {"role": "user", "content": request.message},
            {"role": "assistant", "content": ai_response}
        ]
        conversation.messages = new_messages
        conversation.depth_reached = depth + 1
        db.commit()

    # Update stats
    stars_earned = 5
    achievement = None

    if depth + 1 == 5:
        achievement = "Deep Thinker"
        stars_earned = 25
    elif depth + 1 == 10:
        achievement = "Philosophy Pro"
        stars_earned = 50

    return ChatResponse(
        response=ai_response,
        conversation_id=conversation.id if conversation else "guest",
        depth=depth + 1,
        stars_earned=stars_earned,
        achievement=achievement,
        model_used=model_used
    )

# ============================================================
# API Endpoints - Stats & Progress
# ============================================================

@app.get("/api/stats/{child_id}", response_model=ChildStats)
async def get_child_stats(
    child_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_token)
):
    """Get detailed stats for a child"""
    profile = db.query(ChildProfile).filter(ChildProfile.user_id == child_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Child not found")
    
    # Get topic progress
    topics = {}
    for tp in profile.topic_progress:
        topics[tp.topic] = {
            "level": tp.level,
            "unlocked": tp.unlocked,
            "questions": tp.questions_asked
        }
    
    # Get weekly activity (last 7 days)
    weekly = []
    for i in range(7):
        date = datetime.utcnow() - timedelta(days=6-i)
        activity = db.query(DailyActivity).filter(
            DailyActivity.child_id == profile.id,
            DailyActivity.date >= date.replace(hour=0, minute=0),
            DailyActivity.date < date.replace(hour=23, minute=59)
        ).first()
        weekly.append(activity.questions_asked if activity else 0)
    
    return ChildStats(
        stars=profile.stars,
        streak=profile.streak,
        total_questions=profile.total_questions,
        achievements=profile.achievements or [],
        topics=topics,
        weekly_activity=weekly
    )

# ============================================================
# Health Check
# ============================================================

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Create tables
Base.metadata.create_all(bind=engine)
