from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.family_member import FamilyMember
from app.models.media_item import MediaItem
from app.models.publication import Publication
from app.models.user import User

REFERENCE_EMAIL = "alina.fadeeva@angelo-demo.ru"

FIRST_NAMES = ["Александр", "Мария", "Дмитрий", "Елена", "Сергей", "Ольга", "Андрей", "Наталья", "Михаил", "Ирина", "Алексей", "Татьяна", "Иван", "Светлана", "Николай", "Анна", "Евгений", "Юлия", "Владимир", "Екатерина"]
LAST_NAMES = ["Иванов", "Петров", "Сидоров", "Козлов", "Новиков", "Морозов", "Волков", "Соколов", "Лебедев", "Кузнецов", "Попов", "Васильев", "Смирнов", "Михайлов", "Фёдоров", "Андреев", "Алексеев", "Романов", "Никитин", "Орлов"]
CITIES = ["Москва", "Санкт-Петербург", "Казань", "Новосибирск", "Екатеринбург", "Нижний Новгород", "Вологда", "Сочи", "Калининград", "Самара"]

FAMILY_MEMBERS_BASE = [
    {"first_name": "Владимир", "last_name": "Фадеев", "nickname": "Дедушка", "birth_date": "1959-01-17", "city": "Ленинград", "generation": 1, "avatar_seed": "vladimir"},
    {"first_name": "Ольга", "last_name": "Никулина", "nickname": "Бабушка", "birth_date": "1961-04-11", "city": "Уфа", "generation": 1, "avatar_seed": "olga"},
    {"first_name": "Роман", "last_name": "Никулин", "nickname": "Папа", "birth_date": "1984-03-12", "city": "Вологда", "generation": 2, "avatar_seed": "roman"},
    {"first_name": "Елизавета", "last_name": "Никулина", "nickname": "Лиза", "birth_date": "2010-08-17", "city": "Москва", "generation": 3, "avatar_seed": "liza"},
]

PUBLICATIONS_BASE = [
    {"title": "Лизе 1 год!", "text": "Ровно год назад наша жизнь разделилась на «до» и «после» — и стала в сто раз счастливее.", "event_date": "2011-08-17", "place": "Москва", "topic_tag": "День рождения"},
    {"title": "Первые шаги Лизы", "text": "Этот кадр — моё сердце. Лизе 10 месяцев, и она наконец решилась сделать несколько шагов сама!", "event_date": "2011-07-04", "place": "Москва", "topic_tag": "Будни"},
    {"title": "Новый 2014-й", "text": "31 декабря, мы только недавно въехали, кругом коробки, но ёлку собрали обязательно.", "event_date": "2013-12-31", "place": "Москва", "topic_tag": "Праздники"},
    {"title": "Дикарями на Волге", "text": "Июль 2018. Семь дней на берегу, палатка, костёр, дети бегают босиком.", "event_date": "2018-07-15", "place": "Волга", "topic_tag": "Путешествия"},
    {"title": "Свадьба", "text": "Самый важный день. Рома и я — уже десять лет вместе, и каждый день как подарок.", "event_date": "2012-06-02", "place": "Москва", "topic_tag": "Свадьба"},
]

MULTIPLIER = 5
FAMILY_MEMBERS = FAMILY_MEMBERS_BASE + [
    {
        "first_name": FIRST_NAMES[i],
        "last_name": LAST_NAMES[i],
        "nickname": None,
        "birth_date": f"{1960 + (i % 40)}-{(i % 12) + 1:02d}-15",
        "city": CITIES[i % len(CITIES)],
        "generation": (i % 3) + 1,
        "avatar_seed": f"member{i}",
    }
    for i in range(16)
]
TOPICS = ["Праздники", "День рождения", "Будни", "Путешествия", "Рецепты", "Истории", "Свадьба"]
PUBLICATIONS = [
    {**PUBLICATIONS_BASE[i % 5], "photo_seed": idx + 1, "topic_tag": TOPICS[idx % len(TOPICS)], "event_date": f"{2010 + (idx % 15)}-{(idx % 12) + 1:02d}-{(idx % 28) + 1:02d}"}
    for idx in range(len(PUBLICATIONS_BASE) * MULTIPLIER)
]


def _avatar_url(seed: str) -> str:
    return f"https://i.pravatar.cc/300?u={seed}"


def _photo_url(seed: int) -> str:
    return f"https://picsum.photos/seed/{seed}/800/600"


async def seed_reference_user(db: AsyncSession, user: User, member: FamilyMember) -> None:
    if user.identifier.strip().lower() != REFERENCE_EMAIL:
        return
    pub_count = await db.execute(select(Publication).where(Publication.family_id == user.family_id))
    if pub_count.scalars().first() is not None:
        return
    for fm in FAMILY_MEMBERS:
        m = FamilyMember(
                id=uuid4(),
                family_id=user.family_id,
                first_name=fm["first_name"],
                last_name=fm["last_name"],
                nickname=fm.get("nickname"),
                birth_date=fm["birth_date"],
                city=fm.get("city"),
                role="member",
                is_active=True,
                generation=fm.get("generation", 0),
                relations=[],
                avatar=_avatar_url(fm.get("avatar_seed", "member")),
            )
        db.add(m)
        await db.flush()
    await db.commit()
    result = await db.execute(select(FamilyMember).where(FamilyMember.family_id == user.family_id))
    all_members = list(result.scalars().all())
    author = member
    participant_ids = [str(m.id) for m in all_members if m.id != author.id][:20]
    if not member.avatar:
        member.avatar = _avatar_url("alina")
        await db.commit()
        await db.refresh(member)
    for i, pub_data in enumerate(PUBLICATIONS):
        pub = Publication(
            id=uuid4(),
            family_id=user.family_id,
            author_id=author.id,
            type="photo",
            title=pub_data["title"],
            text=pub_data["text"],
            event_date=pub_data["event_date"],
            place=pub_data.get("place"),
            publish_date=f"2026-{((i % 12) + 1):02d}-{((i % 28) + 1):02d}",
            topic_tag=pub_data.get("topic_tag", ""),
            participant_ids=participant_ids,
            co_author_ids=[],
            visible_for=None,
            exclude_for=None,
            is_read=False,
            content_blocks=[{"type": "photos", "n": 1}],
        )
        db.add(pub)
        await db.flush()
        url = _photo_url(pub_data.get("photo_seed", i + 1))
        media = MediaItem(
            id=uuid4(),
            publication_id=pub.id,
            type="photo",
            url=url,
            thumbnail=url,
            name=pub_data["title"],
            size=0,
        )
        db.add(media)
    await db.commit()
