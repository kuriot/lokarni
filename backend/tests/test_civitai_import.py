import pytest
from backend.routes.civitai_import import sanitize_filename


def test_sanitize_replaces_invalid_chars():
    name = '<>:"/\\|?*example.txt'
    assert sanitize_filename(name) == '_________example.txt'


def test_sanitize_leaves_valid_names():
    assert sanitize_filename('model.ckpt') == 'model.ckpt'
