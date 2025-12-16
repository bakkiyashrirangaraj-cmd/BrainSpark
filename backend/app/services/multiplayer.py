# ============================================================
# BrainSpark Multiplayer & Social System
# app/services/multiplayer.py
# ============================================================

from __future__ import annotations

from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List, Optional, Set
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import asyncio
import json
import random
import uuid

# ============================================================
# ENUMS & TYPES
# ============================================================

class ChallengeType(Enum):
    QUICK_THINK = "quick_think"      # Speed-based Q&A
    DEEP_DIVE = "deep_dive"          # Who goes deepest
    TOPIC_RACE = "topic_race"        # First to explore topic
    RIDDLE_BATTLE = "riddle_battle"  # Solve riddles
    CREATIVE_CLASH = "creative_clash" # Best creative answer

class RoomStatus(Enum):
    WAITING = "waiting"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class FriendStatus(Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    BLOCKED = "blocked"

# ============================================================
# DATA MODELS
# ============================================================

@dataclass
class Player:
    id: str
    name: str
    avatar: str
    age_group: str
    score: int = 0
    answers: List[dict] = field(default_factory=list)
    is_ready: bool = False
    connected: bool = True

@dataclass
class GameRoom:
    id: str
    host_id: str
    challenge_type: ChallengeType
    topic: str
    max_players: int
    status: RoomStatus
    players: Dict[str, Player] = field(default_factory=dict)
    questions: List[dict] = field(default_factory=list)
    current_question: int = 0
    created_at: datetime = field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    settings: dict = field(default_factory=dict)

@dataclass
class Challenge:
    id: str
    challenger_id: str
    challenged_id: str
    challenge_type: ChallengeType
    topic: str
    status: str  # pending, accepted, declined, completed
    winner_id: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)

@dataclass
class FriendRequest:
    id: str
    from_id: str
    to_id: str
    status: FriendStatus
    created_at: datetime = field(default_factory=datetime.utcnow)

# ============================================================
# MULTIPLAYER QUESTIONS DATABASE
# ============================================================

MULTIPLAYER_QUESTIONS = {
    "Space": [
        {"q": "What planet is known as the Red Planet?", "a": "Mars", "points": 10, "time": 15},
        {"q": "How many planets are in our solar system?", "a": "8", "points": 10, "time": 15},
        {"q": "What is the largest planet?", "a": "Jupiter", "points": 15, "time": 20},
        {"q": "What do we call a star that has exploded?", "a": "Supernova", "points": 20, "time": 25},
        {"q": "What force keeps planets in orbit?", "a": "Gravity", "points": 15, "time": 20},
    ],
    "Nature": [
        {"q": "What gas do plants breathe in?", "a": "Carbon dioxide", "points": 15, "time": 20},
        {"q": "What is the largest rainforest?", "a": "Amazon", "points": 10, "time": 15},
        {"q": "What do bees collect from flowers?", "a": "Nectar/Pollen", "points": 10, "time": 15},
        {"q": "What is the process plants use to make food?", "a": "Photosynthesis", "points": 20, "time": 25},
    ],
    "Animals": [
        {"q": "What is the fastest land animal?", "a": "Cheetah", "points": 10, "time": 15},
        {"q": "How many legs does an octopus have?", "a": "8", "points": 10, "time": 15},
        {"q": "What animal is known as the King of the Jungle?", "a": "Lion", "points": 10, "time": 15},
        {"q": "What do you call a group of wolves?", "a": "Pack", "points": 15, "time": 20},
    ],
    "General": [
        {"q": "What color do you get mixing blue and yellow?", "a": "Green", "points": 10, "time": 15},
        {"q": "How many continents are there?", "a": "7", "points": 10, "time": 15},
        {"q": "What is the largest ocean?", "a": "Pacific", "points": 15, "time": 20},
    ]
}

RIDDLES = [
    {"q": "I have cities but no houses, forests but no trees, water but no fish. What am I?", "a": "Map", "points": 25},
    {"q": "What has hands but can't clap?", "a": "Clock", "points": 20},
    {"q": "What gets wetter the more it dries?", "a": "Towel", "points": 20},
    {"q": "I speak without a mouth and hear without ears. What am I?", "a": "Echo", "points": 25},
    {"q": "What can travel around the world while staying in a corner?", "a": "Stamp", "points": 25},
]

CREATIVE_PROMPTS = [
    "Design a new planet and describe what lives there",
    "Invent a new animal by combining two existing ones",
    "If you could have any superpower, what would it be and why?",
    "Create a story in 3 sentences about a time-traveling robot",
    "What would happen if gravity reversed for one day?",
]

# ============================================================
# WEBSOCKET CONNECTION MANAGER
# ============================================================

class ConnectionManager:
    """Manages WebSocket connections for multiplayer"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.rooms: Dict[str, GameRoom] = {}
        self.player_rooms: Dict[str, str] = {}  # player_id -> room_id
        
    async def connect(self, websocket: WebSocket, player_id: str):
        await websocket.accept()
        self.active_connections[player_id] = websocket
        
    def disconnect(self, player_id: str):
        if player_id in self.active_connections:
            del self.active_connections[player_id]
        
        # Handle player leaving room
        if player_id in self.player_rooms:
            room_id = self.player_rooms[player_id]
            if room_id in self.rooms:
                room = self.rooms[room_id]
                if player_id in room.players:
                    room.players[player_id].connected = False
                    
    async def send_to_player(self, player_id: str, message: dict):
        if player_id in self.active_connections:
            await self.active_connections[player_id].send_json(message)
            
    async def broadcast_to_room(self, room_id: str, message: dict, exclude: Set[str] = None):
        if room_id not in self.rooms:
            return
            
        exclude = exclude or set()
        room = self.rooms[room_id]
        
        for player_id in room.players:
            if player_id not in exclude and player_id in self.active_connections:
                await self.active_connections[player_id].send_json(message)

manager = ConnectionManager()

# ============================================================
# GAME LOGIC
# ============================================================

class MultiplayerGame:
    """Core multiplayer game logic"""
    
    def __init__(self, room: GameRoom):
        self.room = room
        self.current_round = 0
        self.round_answers: Dict[str, dict] = {}
        
    async def start_game(self):
        """Initialize and start the game"""
        self.room.status = RoomStatus.IN_PROGRESS
        self.room.started_at = datetime.utcnow()
        
        # Generate questions based on challenge type
        if self.room.challenge_type == ChallengeType.RIDDLE_BATTLE:
            self.room.questions = random.sample(RIDDLES, min(5, len(RIDDLES)))
        elif self.room.challenge_type == ChallengeType.CREATIVE_CLASH:
            self.room.questions = [{"prompt": p} for p in random.sample(CREATIVE_PROMPTS, 3)]
        else:
            topic_questions = MULTIPLAYER_QUESTIONS.get(self.room.topic, MULTIPLAYER_QUESTIONS["General"])
            self.room.questions = random.sample(topic_questions, min(5, len(topic_questions)))
        
        # Notify all players
        await manager.broadcast_to_room(self.room.id, {
            "type": "game_started",
            "challenge_type": self.room.challenge_type.value,
            "total_questions": len(self.room.questions),
            "players": [{"id": p.id, "name": p.name, "avatar": p.avatar} for p in self.room.players.values()]
        })
        
        # Start first round
        await self.next_round()
        
    async def next_round(self):
        """Move to next question/round"""
        if self.room.current_question >= len(self.room.questions):
            await self.end_game()
            return
            
        self.round_answers = {}
        question = self.room.questions[self.room.current_question]
        
        await manager.broadcast_to_room(self.room.id, {
            "type": "new_question",
            "round": self.room.current_question + 1,
            "total_rounds": len(self.room.questions),
            "question": question.get("q") or question.get("prompt"),
            "time_limit": question.get("time", 30),
            "points": question.get("points", 10),
            "is_creative": self.room.challenge_type == ChallengeType.CREATIVE_CLASH
        })
        
        # Start timer
        time_limit = question.get("time", 30)
        await asyncio.sleep(time_limit)
        await self.end_round()
        
    async def submit_answer(self, player_id: str, answer: str, time_taken: float):
        """Process a player's answer"""
        if player_id in self.round_answers:
            return  # Already answered
            
        question = self.room.questions[self.room.current_question]
        is_correct = False
        points = 0
        
        if self.room.challenge_type == ChallengeType.CREATIVE_CLASH:
            # Creative answers scored by AI later
            points = 10  # Base points for participating
            self.round_answers[player_id] = {
                "answer": answer,
                "time": time_taken,
                "points": points,
                "needs_scoring": True
            }
        else:
            # Check if answer is correct
            correct_answer = question.get("a", "").lower()
            is_correct = answer.lower().strip() == correct_answer or answer.lower() in correct_answer.lower()
            
            if is_correct:
                # Faster answers get more points
                base_points = question.get("points", 10)
                time_bonus = max(0, (question.get("time", 30) - time_taken) / question.get("time", 30))
                points = int(base_points * (1 + time_bonus * 0.5))
                
            self.round_answers[player_id] = {
                "answer": answer,
                "correct": is_correct,
                "time": time_taken,
                "points": points
            }
        
        # Update player score
        self.room.players[player_id].score += points
        self.room.players[player_id].answers.append(self.round_answers[player_id])
        
        # Notify player of result
        await manager.send_to_player(player_id, {
            "type": "answer_result",
            "correct": is_correct,
            "points_earned": points,
            "total_score": self.room.players[player_id].score
        })
        
        # Check if all players answered
        if len(self.round_answers) >= len([p for p in self.room.players.values() if p.connected]):
            await self.end_round()
            
    async def end_round(self):
        """End current round and show results"""
        question = self.room.questions[self.room.current_question]
        
        # Calculate round standings
        standings = sorted(
            [(p.id, p.name, p.score) for p in self.room.players.values()],
            key=lambda x: x[2],
            reverse=True
        )
        
        await manager.broadcast_to_room(self.room.id, {
            "type": "round_ended",
            "round": self.room.current_question + 1,
            "correct_answer": question.get("a"),
            "round_results": [
                {
                    "player_id": pid,
                    "answer": self.round_answers.get(pid, {}).get("answer", "No answer"),
                    "correct": self.round_answers.get(pid, {}).get("correct", False),
                    "points": self.round_answers.get(pid, {}).get("points", 0)
                }
                for pid in self.room.players
            ],
            "standings": [{"id": s[0], "name": s[1], "score": s[2]} for s in standings]
        })
        
        self.room.current_question += 1
        
        # Wait before next round
        await asyncio.sleep(5)
        await self.next_round()
        
    async def end_game(self):
        """End the game and determine winner"""
        self.room.status = RoomStatus.COMPLETED
        self.room.ended_at = datetime.utcnow()
        
        # Determine winner
        standings = sorted(
            self.room.players.values(),
            key=lambda p: p.score,
            reverse=True
        )
        
        winner = standings[0] if standings else None
        
        await manager.broadcast_to_room(self.room.id, {
            "type": "game_ended",
            "winner": {"id": winner.id, "name": winner.name, "score": winner.score} if winner else None,
            "final_standings": [
                {"rank": i+1, "id": p.id, "name": p.name, "avatar": p.avatar, "score": p.score}
                for i, p in enumerate(standings)
            ],
            "rewards": {
                "winner_stars": 100,
                "participant_stars": 25
            }
        })

# ============================================================
# API ENDPOINTS
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/multiplayer", tags=["multiplayer"])

class CreateRoomRequest(BaseModel):
    challenge_type: str
    topic: str
    max_players: int = 4

class JoinRoomRequest(BaseModel):
    room_id: str

class ChallengeRequest(BaseModel):
    challenged_id: str
    challenge_type: str
    topic: str

@router.post("/rooms")
async def create_room(request: CreateRoomRequest, current_user: dict = Depends(get_current_user)):
    """Create a new multiplayer room"""
    room_id = str(uuid.uuid4())[:8]
    
    room = GameRoom(
        id=room_id,
        host_id=current_user["id"],
        challenge_type=ChallengeType(request.challenge_type),
        topic=request.topic,
        max_players=request.max_players,
        status=RoomStatus.WAITING
    )
    
    # Add host as first player
    room.players[current_user["id"]] = Player(
        id=current_user["id"],
        name=current_user["name"],
        avatar=current_user.get("avatar", "🧒"),
        age_group=current_user.get("age_group", "explorers"),
        is_ready=True
    )
    
    manager.rooms[room_id] = room
    manager.player_rooms[current_user["id"]] = room_id
    
    return {
        "room_id": room_id,
        "share_code": room_id.upper(),
        "message": "Room created! Share the code with friends."
    }

@router.post("/rooms/join")
async def join_room(request: JoinRoomRequest, current_user: dict = Depends(get_current_user)):
    """Join an existing room"""
    room_id = request.room_id.lower()
    
    if room_id not in manager.rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    
    room = manager.rooms[room_id]
    
    if room.status != RoomStatus.WAITING:
        raise HTTPException(status_code=400, detail="Game already in progress")
    
    if len(room.players) >= room.max_players:
        raise HTTPException(status_code=400, detail="Room is full")
    
    # Add player to room
    room.players[current_user["id"]] = Player(
        id=current_user["id"],
        name=current_user["name"],
        avatar=current_user.get("avatar", "🧒"),
        age_group=current_user.get("age_group", "explorers")
    )
    
    manager.player_rooms[current_user["id"]] = room_id
    
    # Notify other players
    await manager.broadcast_to_room(room_id, {
        "type": "player_joined",
        "player": {"id": current_user["id"], "name": current_user["name"]},
        "player_count": len(room.players)
    }, exclude={current_user["id"]})
    
    return {
        "success": True,
        "room": {
            "id": room_id,
            "host": room.host_id,
            "challenge_type": room.challenge_type.value,
            "topic": room.topic,
            "players": [{"id": p.id, "name": p.name, "avatar": p.avatar} for p in room.players.values()]
        }
    }

@router.post("/challenge")
async def send_challenge(request: ChallengeRequest, current_user: dict = Depends(get_current_user)):
    """Challenge a friend to a 1v1"""
    challenge = Challenge(
        id=str(uuid.uuid4()),
        challenger_id=current_user["id"],
        challenged_id=request.challenged_id,
        challenge_type=ChallengeType(request.challenge_type),
        topic=request.topic,
        status="pending"
    )
    
    # Store challenge in database
    # Send notification to challenged player
    
    return {
        "challenge_id": challenge.id,
        "message": "Challenge sent!"
    }

@router.get("/leaderboard")
async def get_leaderboard(scope: str = "global", limit: int = 20):
    """Get multiplayer leaderboard"""
    # Query database for top players
    return {
        "scope": scope,
        "leaderboard": [
            {"rank": i, "name": f"Player {i}", "wins": 100-i*5, "stars": 10000-i*500}
            for i in range(1, min(limit+1, 21))
        ]
    }

# ============================================================
# WEBSOCKET ENDPOINT
# ============================================================

@router.websocket("/ws/{room_id}/{player_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, player_id: str):
    await manager.connect(websocket, player_id)
    
    try:
        while True:
            data = await websocket.receive_json()
            
            if data["type"] == "ready":
                # Player is ready to start
                if room_id in manager.rooms:
                    room = manager.rooms[room_id]
                    if player_id in room.players:
                        room.players[player_id].is_ready = True
                        
                        # Check if all players ready
                        all_ready = all(p.is_ready for p in room.players.values())
                        if all_ready and len(room.players) >= 2:
                            game = MultiplayerGame(room)
                            await game.start_game()
                            
            elif data["type"] == "answer":
                # Player submitted an answer
                if room_id in manager.rooms:
                    room = manager.rooms[room_id]
                    game = MultiplayerGame(room)
                    await game.submit_answer(player_id, data["answer"], data.get("time", 0))
                    
            elif data["type"] == "chat":
                # In-game chat message
                await manager.broadcast_to_room(room_id, {
                    "type": "chat",
                    "player_id": player_id,
                    "message": data["message"]
                })
                
    except WebSocketDisconnect:
        manager.disconnect(player_id)
        await manager.broadcast_to_room(room_id, {
            "type": "player_disconnected",
            "player_id": player_id
        })

def get_current_user():
    """Dependency to get current user - implement with your auth"""
    pass
