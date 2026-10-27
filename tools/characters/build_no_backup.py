#!/usr/bin/env python3
"""Дополнительные персонажи ролика «Бүгүн жеткире турган киши жок»
(BalaGoNoBackup): бабушка и мама в уличном жилете.

Используется тот же сборщик MakeHuman (CC0), что и для остальных персонажей
(build_characters.py, без изменений); здесь только параметры новых моделей.
Мама, папа, дочка и коллега — существующие модели (mom, husband, girl,
colleague).

Запуск: tools/characters/fetch_makehuman.sh && python3 tools/characters/build_no_backup.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_characters as bc  # noqa: E402

EXTRA = {
    # бабушка: ~65 лет, седые волосы в низком пучке, тёплая кофта
    "grandma": dict(gender=0.0, age=66, muscle=0.4, weight=0.62,
                    race={"asian": 0.85, "caucasian": 0.15}, height=1.57,
                    skin="#D9AA86", hair="#B8B2AC", hairStyle="bun_low", brows="#8A837D",
                    top="#EFE6D8", topSleeves="long", vest="#5E7D8F", bottom="#4A4A57",
                    shoes="#3A302B", jacket=None, skirt=None),
    # мама на улице: та же модель mom + жилет песочного цвета (снимает в офисе)
    "mom_out": dict(bc.CHARACTERS["mom"], vest="#B98A5E"),
}

if __name__ == "__main__":
    only = sys.argv[1:]
    bc.CHARACTERS.clear()
    bc.CHARACTERS.update({k: v for k, v in EXTRA.items() if not only or k in only})
    bc.main()
