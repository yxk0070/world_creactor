from flask import Blueprint, request, jsonify, Response, stream_with_context
from cache.cache_manager import cache_manager
import json
import uuid

api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/cache/all', methods=['GET'])
def get_all_cache():
    try:
        categories = ["worldview", "character", "story", "article", "dialogue", "script"]
        result = {cat: cache_manager.get_by_category(cat) for cat in categories}
        stats = {cat: len(items) for cat, items in result.items()}
        return jsonify({'success': True, 'data': result, 'stats': stats})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@api_bp.route('/cache/category', methods=['POST'])
def get_cache_by_category():
    try:
        req_data = request.json
        category = req_data.get('category')
        if not category:
            return jsonify({'error': '请提供 category 参数'}), 400
        items = cache_manager.get_by_category(category)
        return jsonify({'success': True, 'data': items})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@api_bp.route('/cache/worldview', methods=['POST'])
def get_cache_by_worldview():
    try:
        req_data = request.json
        worldview_id = req_data.get('worldview_id')
        category = req_data.get('category')
        if not worldview_id:
            return jsonify({'error': '请提供 worldview_id 参数'}), 400
        items = cache_manager.get_by_worldview(worldview_id, category)
        return jsonify({'success': True, 'data': items})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@api_bp.route('/cache/<item_id>', methods=['GET'])
def get_cache_item(item_id):
    try:
        item = cache_manager.get(item_id)
        if item:
            return jsonify({'success': True, 'data': item})
        return jsonify({'success': False, 'error': '未找到缓存项'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@api_bp.route('/cache/update', methods=['POST'])
def update_cache_item():
    try:
        req_data = request.json
        item_id = req_data.get('id')
        data = req_data.get('data')
        name = req_data.get('name')
        if not item_id or not data:
            return jsonify({'error': '请提供 id 和 data 参数'}), 400
        success = cache_manager.update(item_id, data, name)
        if success:
            return jsonify({'success': True})
        return jsonify({'success': False, 'error': '更新失败'}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@api_bp.route('/cache/delete', methods=['POST'])
def delete_cache_item():
    try:
        req_data = request.json
        item_id = req_data.get('id')
        if not item_id:
            return jsonify({'error': '请提供 id 参数'}), 400
        success = cache_manager.delete(item_id)
        if success:
            return jsonify({'success': True})
        return jsonify({'success': False, 'error': '删除失败'}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@api_bp.route('/cache/clear', methods=['POST'])
def clear_cache_category():
    try:
        req_data = request.json
        category = req_data.get('category')
        if not category:
            return jsonify({'error': '请提供 category 参数'}), 400
        success = cache_manager.clear_category(category)
        if success:
            return jsonify({'success': True})
        return jsonify({'success': False, 'error': '清空失败'}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@api_bp.route('/cache/save', methods=['POST'])
def save_cache():
    try:
        req_data = request.json
        tool_name = req_data.get('type')
        data_to_save = req_data.get('data')
        name = req_data.get('name')
        worldview_id = req_data.get('worldview_id')
        if not tool_name or not data_to_save:
            return jsonify({'error': '请提供 type(tool_name) 和 data'}), 400
        if isinstance(data_to_save, dict) and 'tool' not in data_to_save:
            data_to_save['tool'] = tool_name
        cache_id = cache_manager.save(tool_name, data_to_save, name=name, worldview_id=worldview_id)
        return jsonify({'success': True, 'id': cache_id})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@api_bp.route('/cache/search', methods=['POST'])
def search_cache():
    try:
        req_data = request.json
        keyword = req_data.get('keyword', '')
        items = cache_manager.search(keyword)
        return jsonify({'success': True, 'data': items})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
