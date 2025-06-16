from backend.schemas import Asset


def make_asset(**kwargs):
    defaults = dict(
        id=1,
        name='a',
        type='t',
        path='p',
        preview_image='i',
        description='d',
        trigger_words='tw',
        positive_prompt='pp',
        negative_prompt='np',
        tags='tg',
        model_version='mv',
        used_resources='ur',
        is_favorite=False,
        subcategory_id=None,
        slug='s',
        creator='cr',
        base_model='bm',
        created_at='ca',
        nsfw_level='nl',
        download_url='du'
    )
    defaults.update(kwargs)
    return Asset(**defaults)


def test_custom_fields_defaults_to_empty_dict():
    asset = make_asset(custom_fields=None)
    assert asset.custom_fields == {}


def test_custom_fields_preserves_values():
    asset = make_asset(custom_fields={'foo': 'bar'})
    assert asset.custom_fields == {'foo': 'bar'}
