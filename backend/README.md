## Установка
```bash
# В папке с проектом создаем вирутальное окружение
python -m venv venv


# Активируем окружение
.\venv\Scripts\activate # для Windows
source venv/Scripts/activate # для Linux/MacOS

pip install -r requirements.txt
```

## Запуск
```
uvicorn app:app --reload
```
