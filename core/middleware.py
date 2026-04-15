from functools import wraps
from flask import request, jsonify
import time

# 简单内存限流字典: { ip: [timestamp1, timestamp2] }
RATE_LIMIT_STORE = {}
RATE_LIMIT_MAX_REQUESTS = 10  # 每分钟 10 次请求
RATE_LIMIT_WINDOW = 60        # 60秒窗口

def check_rate_limit(ip: str) -> bool:
    now = time.time()
    if ip not in RATE_LIMIT_STORE:
        RATE_LIMIT_STORE[ip] = []
    
    # 清理过期记录
    RATE_LIMIT_STORE[ip] = [ts for ts in RATE_LIMIT_STORE[ip] if now - ts < RATE_LIMIT_WINDOW]
    
    if len(RATE_LIMIT_STORE[ip]) >= RATE_LIMIT_MAX_REQUESTS:
        return False
        
    RATE_LIMIT_STORE[ip].append(now)
    return True

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # 预留鉴权逻辑：从 Headers 获取 Token
        # token = request.headers.get('Authorization')
        # if not token or token != "Bearer expected_token":
        #     return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated

def rate_limit(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        ip = request.remote_addr
        if not check_rate_limit(ip):
            return jsonify({'error': 'Too many requests, please try again later.'}), 429
        return f(*args, **kwargs)
    return decorated
