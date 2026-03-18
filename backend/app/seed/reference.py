import logging
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.family_member import FamilyMember
from app.models.media_item import MediaItem
from app.models.publication import Publication
from app.models.user import User

REFERENCE_EMAIL = "alina.fadeeva@angelo-demo.ru"

FIRST_NAMES = ["Александр", "Мария", "Дмитрий", "Елена", "Сергей", "Ольга", "Андрей", "Наталья", "Михаил", "Ирина", "Алексей", "Татьяна", "Иван", "Светлана", "Николай", "Анна", "Евгений", "Юлия", "Владимир", "Екатерина"]
LAST_NAMES = ["Иванов", "Петров", "Сидоров", "Козлов", "Новиков", "Морозов", "Волков", "Соколов", "Лебедев", "Кузнецов", "Попов", "Васильев", "Смирнов", "Михайлов", "Фёдоров", "Андреев", "Алексеев", "Романов", "Никитин", "Орлов"]
CITIES = ["Москва", "Санкт-Петербург", "Казань", "Новосибирск", "Екатеринбург", "Нижний Новгород", "Вологда", "Сочи", "Калининград", "Самара"]

FAMILY_MEMBERS_BASE = [
    {
        "first_name": "Владимир",
        "last_name": "Фадеев",
        "middle_name": "Николаевич",
        "nickname": "Дедушка",
        "birth_date": "1959-01-17",
        "city": "Ленинград",
        "generation": 1,
        "avatar_seed": "vladimir",
        "about": "Папа Алины Фадеевой. Любит рыбалку и поездки на природу.",
    },
    {
        "first_name": "Ольга",
        "last_name": "Никулина",
        "middle_name": "Васильевна",
        "nickname": "Бабушка",
        "birth_date": "1961-04-11",
        "city": "Уфа",
        "generation": 1,
        "avatar_seed": "olga",
        "about": "Мама Романа Никулина. Главный хранитель рецептов и семейных традиций.",
    },
    {
        "first_name": "Роман",
        "last_name": "Никулин",
        "middle_name": None,
        "nickname": "Папа",
        "birth_date": "1984-03-12",
        "city": "Вологда",
        "generation": 2,
        "avatar_seed": "roman",
        "about": "Папа Елизаветы. Спокойный и надёжный, умеет поддержать в нужный момент.",
    },
    {
        "first_name": "Елизавета",
        "last_name": "Никулина",
        "middle_name": None,
        "nickname": "Лиза",
        "birth_date": "2010-08-17",
        "city": "Москва",
        "generation": 3,
        "avatar_seed": "liza",
        "about": "Дочь. Добрая, смелая, умеет радоваться мелочам.",
    },
]

FAMILY_MEMBERS_TEST = [
    {"first_name": "Анна", "last_name": "Соколова", "nickname": "Аня (тест)", "birth_date": "1998-05-22", "city": "Казань", "generation": 3, "avatar_seed": "anna-test", "about": "Двоюродная сестра. Тестовый участник для демонстрации."},
    {"first_name": "Дмитрий", "last_name": "Волков", "nickname": "Дядя Дима (тест)", "birth_date": "1981-11-08", "city": "Вологда", "generation": 2, "avatar_seed": "dmitry-test", "about": "Брат Алины. Тестовый участник для демонстрации."},
    {"first_name": "Светлана", "last_name": "Петрова", "nickname": "Тётя Света (тест)", "birth_date": "1979-03-15", "city": "Уфа", "generation": 2, "avatar_seed": "svetlana-test", "about": "Сестра Романа. Тестовый участник для демонстрации."},
    {"first_name": "Кирилл", "last_name": "Морозов", "nickname": "Кирилл (тест)", "birth_date": "2001-07-30", "city": "Сочи", "generation": 3, "avatar_seed": "kirill-test", "about": "Двоюродный брат. Тестовый участник для демонстрации."},
    {"first_name": "Мария", "last_name": "Лебедева", "nickname": "Маша (тест)", "birth_date": "2012-02-14", "city": "Вологда", "generation": 3, "avatar_seed": "maria-test", "about": "Двоюродная сестра. Тестовый участник для демонстрации."},
]

FAMILY_MEMBERS = FAMILY_MEMBERS_BASE + FAMILY_MEMBERS_TEST

PUBLICATIONS = [
    {
        "title": "Лизе 1 год!",
        "text": "Ровно год назад наша жизнь разделилась на «до» и «после» — и стала в сто раз счастливее. В этой студии мы впервые фотографировались втроём, когда Лизе был месяц, и вот мы снова здесь, но наша малышка уже вовсю стоит (и даже пытается бежать от мамы с папой!). Смотрю на этот кадр и не верю, что пролетел целый год. Спасибо вам за ваши тёплые слова и поддержку всё это время!",
        "event_date": "2011-08-17",
        "place": "Москва",
        "topic_tag": "День рождения",
        "photo_file": "Фото 1.jpg",
        "author_seed": "alina",
    },
    {
        "title": "Первые шаги Лизы",
        "text": "Этот кадр — моё сердце. Лизе 10 месяцев, и в прошлые выходные она наконец решилась отпустить наши пальцы и сделать несколько шагов сама! Рома присел рядом и ловил каждое её движение, пока я бегала с соской на всякий случай. Смотрю на это фото и слышу этот день: Лизин восторженный визг и папино «давай, малыш, ещё шаг!». Бабушка Оля потом сказала, что Рома в детстве точно так же топал — вся в папу!",
        "event_date": "2011-07-04",
        "place": "Москва",
        "topic_tag": "Будни",
        "photo_file": "Фото 2.png",
        "author_seed": "roman",
    },
    {
        "title": "Новый 2014-й: первые праздники на новой месте",
        "text": "31 декабря, мы только недавно въехали, кругом коробки, но ёлку собрали обязательно — без неё ведь не Новый год! Лизе три, и она впервые осознанно помогала наряжать: Рома сажал её на плечи, чтобы она достала до верхних веток, а мой папа руководил процессом с дивана и ловил разбитые игрушки. Спасибо ему, что приехал к нам в Москву встречать праздник — без дедушки совсем не то. Этот Новый год запомнился запахом мандаринов, свежего ремонта и невероятным чувством: у нас наконец-то СВОЙ угол.",
        "event_date": "2013-12-31",
        "place": "Москва",
        "topic_tag": "Праздники",
        "photo_file": "Фото 3.png",
        "author_seed": "alina",
    },
    {
        "title": "Дикарями на Волге. Июль 2018",
        "text": "Это был наш первый длинный выход с палатками! Лизе восемь, и она впервые увидела, как просыпается Волга. Мы с Ромой долго спорили, брать ли горелку или просто костёр, но в итоге победил дедушка — сказал, что настоящая рыбалка бывает только с дымком. На фото я помогаю Лизе собрать рюкзак (она утрамбовала туда три пачки зефира и любимую книжку), а мой папа уже подготовил лодку и ждёт Лизу. «Деда, а клюёт?» — «Клюёт, только если ты побыстрее соберёшься!» Тот самый день, когда мы поняли, что палатка лучше любого отеля.",
        "event_date": "2018-07-15",
        "place": "Ржев",
        "topic_tag": "Путешествия",
        "photo_file": "Фото 4.png",
        "author_seed": "alina",
    },
    {
        "title": "Дядя Дима на рыбалке",
        "text": "Первый выезд на воду в этом сезоне — утро, тишина и терпение. Дима уверяет, что лучший улов начинается с хорошего чая и правильной компании.",
        "event_date": "2024-08-19",
        "place": "Рыбинское водохранилище",
        "topic_tag": "Путешествия",
        "feed_index": 11,
        "author_seed": "dmitry-test",
    },
    {
        "title": "В гостях у тёти Светы",
        "text": "Света встречает нас так, будто мы не виделись целую вечность. Пироги, чай и разговоры до позднего вечера — за это я и люблю Уфу.",
        "event_date": "2024-11-10",
        "place": "Уфа",
        "topic_tag": "Будни",
        "feed_index": 12,
        "author_seed": "svetlana-test",
    },
    {
        "title": "Кирилл и море",
        "text": "Кирилл впервые встал на доску — и, конечно, сразу захотел «ещё раз». Сочи умеет делать людей счастливее за один день.",
        "event_date": "2024-05-02",
        "place": "Сочи",
        "topic_tag": "Путешествия",
        "feed_index": 5,
        "author_seed": "kirill-test",
    },
    {
        "title": "Аня защитила диплом",
        "text": "Наконец-то всё позади: бессонные ночи, кофе литрами и бесконечные правки. Аня держит диплом и улыбается — мы гордимся!",
        "event_date": "2024-06-28",
        "place": "Казань",
        "topic_tag": "Истории",
        "feed_index": 7,
        "author_seed": "anna-test",
    },
    {
        "title": "Маша испекла шарлотку",
        "text": "Маша настояла, что всё сделает сама: яблоки, тесто и даже сахар «на глаз». Получилось неожиданно идеально — бабушка бы одобрила.",
        "event_date": "2024-12-31",
        "place": "Вологда",
        "topic_tag": "Рецепты",
        "feed_index": 6,
        "author_seed": "maria-test",
    },
]


def _avatar_url(seed: str) -> str:
    proto = "/prototype/avatars"
    avatar_map = {
        "vladimir": f"{proto}/avatar-man-elderly.png",
        "olga": f"{proto}/avatar-woman-elderly.png",
        "roman": f"{proto}/avatar-man-dad.png",
        "liza": f"{proto}/avatar-woman-young.png",
        "alina": f"{proto}/avatar-woman-mom.png",
        "anna-test": f"{proto}/avatar-test-anna.png",
        "dmitry-test": f"{proto}/avatar-test-dmitry.png",
        "svetlana-test": f"{proto}/avatar-test-svetlana.png",
        "kirill-test": f"{proto}/avatar-test-kirill.png",
        "maria-test": f"{proto}/avatar-test-maria.png",
    }
    return avatar_map.get(seed, f"{proto}/avatar-man-beard-glasses.png")


TITLE_TO_FILE = {
    "Лизе 1 год!": "Фото 1.jpg",
    "Первые шаги Лизы": "Фото 2.png",
    "Новый 2014-й": "Фото 3.png",
    "Новый 2014-й: первые праздники на новой месте": "Фото 3.png",
    "Дикарями на Волге": "Фото 4.png",
    "Дикарями на Волге. Июль 2018": "Фото 4.png",
    "Майский Сочи: когда обманули календарь": "Фото 5.png",
    "Бабушкины рецепты — лучшие": "Фото 6.png",
    "Наша гордость": "Фото7.png",
    "Выпускной в Казанском университете": "Фото7.png",
    "Тбилиси — город, в который влюбляешься": "Фото 4.png",
    "Рыбалка с Кириллом на Рыбинке": "Фото 4.png",
    "60 лет отцу — праздник на берегу": "Фото 5.png",
    "Оливье по бабушкиному рецепту": "Фото 6.png",
    "Воскресный обед в кругу семьи": "Фото 1.jpg",
    "Сезон сноуборда открыт": "Фото 5.png",
    "Сессия закрыта — можно выдохнуть": "Фото 2.png",
    "Школьный бал — первый выход в свет": "Фото7.png",
    "Каникулы у тёти Светы": "Фото 3.png",
}

TOPIC_TO_FILES = {
    "День рождения": ["Фото 1.jpg", "Фото 3.png"],
    "Будни": ["Фото 2.png"],
    "Праздники": ["Фото 3.png", "Фото 1.jpg"],
    "Путешествия": ["Фото 4.png", "Фото 5.png"],
    "Рецепты": ["Фото 6.png"],
    "Истории": ["Фото7.png", "Фото 3.png"],
    "Свадьба": ["Фото 1.jpg", "Фото 3.png"],
}
DEFAULT_FILES = ["Фото 1.jpg", "Фото 2.png", "Фото 3.png"]

PHOTO_TO_LATIN = {
    "Фото 1.jpg": "photo1.jpg",
    "Фото 2.png": "photo2.png",
    "Фото 3.png": "photo3.png",
    "Фото 4.png": "photo4.png",
    "Фото 5.png": "photo5.png",
    "Фото 6.png": "photo6.png",
    "Фото7.png": "photo7.png",
}


def _photo_url(pub_data: dict, seed: int) -> str:
    title = pub_data.get("title") or ""
    explicit = pub_data.get("photo_file") or TITLE_TO_FILE.get(title)
    if explicit:
        fname = PHOTO_TO_LATIN.get(explicit, explicit)
        return f"/demo/media/{fname}"
    feed_index = pub_data.get("feed_index")
    if feed_index is None:
        feed_index = int(seed)
    n = ((int(feed_index) - 1) % 25) + 1
    return f"/demo/feed/{n}.jpg"


logger = logging.getLogger(__name__)


async def seed_reference_user(db: AsyncSession, user: User, member: FamilyMember, force: bool = False) -> None:
    if user.identifier.strip().lower() != REFERENCE_EMAIL:
        return
    if not user.family_id:
        logger.warning("seed_reference_user: user has no family_id")
        return
    pub_result = await db.execute(select(Publication).where(Publication.family_id == user.family_id))
    pub_list = list(pub_result.scalars().all())
    member_result = await db.execute(select(FamilyMember).where(FamilyMember.family_id == user.family_id))
    existing_members = list(member_result.scalars().all())

    if force:
        for p in pub_list:
            await db.delete(p)
        for m in existing_members:
            if m.id != member.id:
                await db.delete(m)
        await db.commit()
        pub_list = []
        existing_members = [member]
    elif len(pub_list) >= len(PUBLICATIONS) and len(existing_members) >= len(FAMILY_MEMBERS) + 1:
        return

    existing_key = {(m.first_name, m.last_name, m.birth_date) for m in existing_members}
    members_to_add = [
        fm for fm in FAMILY_MEMBERS
        if (fm["first_name"], fm["last_name"], fm["birth_date"]) not in existing_key
    ]
    for fm in members_to_add:
        m = FamilyMember(
                id=uuid4(),
                family_id=user.family_id,
                first_name=fm["first_name"],
                last_name=fm["last_name"],
                middle_name=fm.get("middle_name"),
                nickname=fm.get("nickname"),
                birth_date=fm["birth_date"],
                city=fm.get("city"),
                about=fm.get("about"),
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
    if not member.avatar:
        member.avatar = _avatar_url("alina")
        await db.commit()
        await db.refresh(member)
    def _k(first: str, last: str, birth: str) -> tuple[str, str, str]:
        return (first.strip(), last.strip(), birth.strip())

    by_key = {_k(m.first_name, m.last_name, m.birth_date): m for m in all_members}
    vladimir = by_key.get(_k("Владимир", "Фадеев", "1959-01-17"))
    olga = by_key.get(_k("Ольга", "Никулина", "1961-04-11"))
    roman = by_key.get(_k("Роман", "Никулин", "1984-03-12"))
    liza = by_key.get(_k("Елизавета", "Никулина", "2010-08-17"))
    dmitry = by_key.get(_k("Дмитрий", "Волков", "1981-11-08"))
    svetlana = by_key.get(_k("Светлана", "Петрова", "1979-03-15"))
    kirill = by_key.get(_k("Кирилл", "Морозов", "2001-07-30"))
    anna = by_key.get(_k("Анна", "Соколова", "1998-05-22"))
    maria = by_key.get(_k("Мария", "Лебедева", "2012-02-14"))

    rel_updates: dict[FamilyMember, list[dict]] = {}
    if vladimir:
        rel_updates[vladimir] = [
            {"memberId": str(member.id), "type": "child"},
            {"memberId": str(dmitry.id), "type": "child"} if dmitry else None,
        ]
    if olga:
        rel_updates[olga] = [
            {"memberId": str(roman.id), "type": "child"} if roman else None,
            {"memberId": str(svetlana.id), "type": "child"} if svetlana else None,
        ]
    rel_updates[member] = [
        {"memberId": str(vladimir.id), "type": "parent"} if vladimir else None,
        {"memberId": str(roman.id), "type": "spouse"} if roman else None,
        {"memberId": str(liza.id), "type": "child"} if liza else None,
    ]
    if roman:
        rel_updates[roman] = [
            {"memberId": str(olga.id), "type": "parent"} if olga else None,
            {"memberId": str(member.id), "type": "spouse"},
            {"memberId": str(liza.id), "type": "child"} if liza else None,
            {"memberId": str(svetlana.id), "type": "sibling"} if svetlana else None,
        ]
    if liza:
        rel_updates[liza] = [
            {"memberId": str(roman.id), "type": "parent"} if roman else None,
            {"memberId": str(member.id), "type": "parent"},
        ]
    if dmitry:
        rel_updates[dmitry] = [
            {"memberId": str(vladimir.id), "type": "parent"} if vladimir else None,
            {"memberId": str(kirill.id), "type": "child"} if kirill else None,
            {"memberId": str(member.id), "type": "sibling"},
        ]
    if svetlana:
        rel_updates[svetlana] = [
            {"memberId": str(olga.id), "type": "parent"} if olga else None,
            {"memberId": str(anna.id), "type": "child"} if anna else None,
            {"memberId": str(maria.id), "type": "child"} if maria else None,
            {"memberId": str(roman.id), "type": "sibling"} if roman else None,
        ]
    if kirill:
        rel_updates[kirill] = [
            {"memberId": str(dmitry.id), "type": "parent"} if dmitry else None,
        ]
    if anna:
        rel_updates[anna] = [
            {"memberId": str(svetlana.id), "type": "parent"} if svetlana else None,
        ]
    if maria:
        rel_updates[maria] = [
            {"memberId": str(svetlana.id), "type": "parent"} if svetlana else None,
        ]

    for m, rels in rel_updates.items():
        m.relations = [r for r in rels if r is not None]
    await db.commit()
    pub_check = await db.execute(select(Publication).where(Publication.family_id == user.family_id))
    existing_pubs = list(pub_check.scalars().all())
    existing_titles = {p.title for p in existing_pubs}
    all_members = sorted(all_members, key=lambda m: (m.first_name or "", m.last_name or "", m.birth_date or ""))
    for i, pub_data in enumerate(PUBLICATIONS):
        if pub_data["title"] in existing_titles:
            continue
        author_seed = pub_data.get("author_seed")
        if author_seed:
            if author_seed == "alina":
                author = member
            else:
                author = next((m for m in all_members if m.avatar == _avatar_url(author_seed)), None) or member
        else:
            author = all_members[i % max(1, len(all_members))]
        participant_ids = [str(m.id) for m in all_members if m.id != author.id][:50]
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
        url = _photo_url(pub_data, pub_data.get("photo_seed", i + 1))
        media = MediaItem(
            id=uuid4(),
            publication_id=pub.id,
            type="photo",
            url=f"{url}?v={str(pub.id)[:8]}",
            thumbnail=f"{url}?v={str(pub.id)[:8]}",
            name=pub_data["title"],
            size=0,
        )
        db.add(media)
    await db.commit()
