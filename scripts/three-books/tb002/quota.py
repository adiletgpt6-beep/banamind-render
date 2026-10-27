"""Print ElevenLabs character usage of the configured account (no secrets are printed)."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
import el  # noqa: E402

s = el.get_json("/v1/user/subscription")
print(f"tier={s.get('tier')} characters used={s.get('character_count')} limit={s.get('character_limit')} "
      f"reset_unix={s.get('next_character_count_reset_unix')}")
