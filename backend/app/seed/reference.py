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
    {"first_name": "Владимир", "last_name": "Фадеев", "nickname": "Дедушка", "birth_date": "1959-01-17", "city": "Ленинград", "generation": 1, "avatar_seed": "vladimir"},
    {"first_name": "Ольга", "last_name": "Никулина", "nickname": "Бабушка", "birth_date": "1961-04-11", "city": "Уфа", "generation": 1, "avatar_seed": "olga"},
    {"first_name": "Роман", "last_name": "Никулин", "nickname": "Папа", "birth_date": "1984-03-12", "city": "Вологда", "generation": 2, "avatar_seed": "roman"},
    {"first_name": "Елизавета", "last_name": "Никулина", "nickname": "Лиза", "birth_date": "2010-08-17", "city": "Москва", "generation": 3, "avatar_seed": "liza"},
]

FAMILY_MEMBERS = FAMILY_MEMBERS_BASE + [
    {
        "first_name": FIRST_NAMES[i % len(FIRST_NAMES)],
        "last_name": LAST_NAMES[i % len(LAST_NAMES)],
        "nickname": None,
        "birth_date": f"{1960 + (i % 40)}-{(i % 12) + 1:02d}-15",
        "city": CITIES[i % len(CITIES)],
        "generation": (i % 3) + 1,
        "avatar_seed": f"member{i}",
    }
    for i in range(16)
]

PUBLICATIONS = [
    {
        "title": "Лизе 1 год!",
        "text": "Ровно год назад наша жизнь разделилась на «до» и «после» — и стала в сто раз счастливее. В этой студии мы впервые фотографировались втроём, когда Лизе был месяц, и вот мы снова здесь, но наша малышка уже вовсю стоит (и даже пытается бежать от мамы с папой!). Смотрю на этот кадр и не верю, что пролетел целый год. Спасибо вам за ваши тёплые слова и поддержку всё это время!",
        "event_date": "2011-08-17",
        "place": "Москва",
        "topic_tag": "День рождения",
        "photo_file": "Фото 1.jpg",
    },
    {
        "title": "Первые шаги Лизы",
        "text": "Этот кадр — моё сердце. Лизе 10 месяцев, и в прошлые выходные она наконец решилась отпустить наши пальцы и сделать несколько шагов сама! Рома присел рядом и ловил каждое её движение, пока я бегала с соской на всякий случай. Смотрю на это фото и слышу этот день: Лизин восторженный визг и папино «давай, малыш, ещё шаг!». Бабушка Оля потом сказала, что Рома в детстве точно так же топал — вся в папу!",
        "event_date": "2011-07-04",
        "place": "Москва",
        "topic_tag": "Будни",
        "photo_file": "Фото 2.png",
    },
    {
        "title": "Новый 2014-й: первые праздники на новой месте",
        "text": "31 декабря, мы только недавно въехали, кругом коробки, но ёлку собрали обязательно — без неё ведь не Новый год! Лизе три, и она впервые осознанно помогала наряжать: Рома сажал её на плечи, чтобы она достала до верхних веток, а мой папа руководил процессом с дивана и ловил разбитые игрушки. Спасибо ему, что приехал к нам в Москву встречать праздник — без дедушки совсем не то. Этот Новый год запомнился запахом мандаринов, свежего ремонта и невероятным чувством: у нас наконец-то СВОЙ угол.",
        "event_date": "2013-12-31",
        "place": "Москва",
        "topic_tag": "Праздники",
        "photo_file": "Фото 3.png",
    },
    {
        "title": "Дикарями на Волге. Июль 2018",
        "text": "Это был наш первый длинный выход с палатками! Лизе восемь, и она впервые увидела, как просыпается Волга. Мы с Ромой долго спорили, брать ли горелку или просто костёр, но в итоге победил дедушка — сказал, что настоящая рыбалка бывает только с дымком. На фото я помогаю Лизе собрать рюкзак (она утрамбовала туда три пачки зефира и любимую книжку), а мой папа уже подготовил лодку и ждёт Лизу. «Деда, а клюёт?» — «Клюёт, только если ты побыстрее соберёшься!» Тот самый день, когда мы поняли, что палатка лучше любого отеля.",
        "event_date": "2018-07-15",
        "place": "Ржев",
        "topic_tag": "Путешествия",
        "photo_file": "Фото 4.png",
    },
    {
        "title": "Майский Сочи: когда обманули календарь",
        "text": "Май— мы сбежали из Москвы на три дня, и это было лучшее решение. Вода в море ещё холодная, но воздух уже совсем летний. Мы гуляли по гальке босиком, Рома тащил подстилку и бутерброды, а я ловила момент и думала: вот оно, счастье — просто идти вдоль воды и держать их за руки. Лизе стесняется, когда её фотографируют, но тут забылась и смеялась по-настоящему. Сочи, спасибо за это тепло в начале мая.",
        "event_date": "2019-05-02",
        "place": "Сочи",
        "topic_tag": "Путешествия",
        "photo_file": "Фото 5.png",
    },
    {
        "title": "Бабушкины рецепты — лучшие",
        "text": "Урожай яблок в тот год был такой, что мы не знали, куда их девать — Ольга Васильевна сказала: «Будем печь шарлотку!» Лиза впервые готовила почти полностью сама (я только щёлкала камерой, пока Рома пытался объяснить, как правильно взбивать яйца). Бабушка руководила процессом: «Муку просей, сахара не жалей, и никаких миксеров — венчиком вкуснее!» Скоро пирог отправится в духовку, а на столе уже заваривается чай.",
        "event_date": "2020-08-14",
        "place": "Подмосковье",
        "topic_tag": "Рецепты",
        "photo_file": "Фото 6.png",
    },
    {
        "title": "Наша гордость",
        "text": "19 мая, школьный актовый зал. Лизе вручили грамоту за волонтёрский проект — она весь год помогала в приюте для животных и организовала сбор корма. Пока её приглашали на сцену, я чуть не расплакалась в третьем ряду. Рома с бабушкой Олей пробрались поближе к сцене и встретили её вот такими объятиями. Лиза смущается, но по глазам видно — ей важно, что они здесь. Смотрю на эту фотку и думаю: наш ребёнок растёт не просто умной, а доброй. Мы всё делаем правильно.",
        "event_date": "2024-05-19",
        "place": "Москва",
        "topic_tag": "Истории",
        "photo_file": "Фото7.png",
    },
]


def _avatar_url(seed: str) -> str:
    return f"https://i.pravatar.cc/300?u={seed}"


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


def _photo_url(pub_data: dict, seed: int) -> str:
    from urllib.parse import quote

    base = get_settings().frontend_url.rstrip("/")
    title = pub_data.get("title") or ""
    explicit = pub_data.get("photo_file") or TITLE_TO_FILE.get(title)
    if explicit:
        fname = explicit
    else:
        topic_tag = pub_data.get("topic_tag", "")
        files = TOPIC_TO_FILES.get(topic_tag, DEFAULT_FILES)
        fname = files[seed % len(files)]
    return f"{base}/demo/media/{quote(fname)}"


logger = logging.getLogger(__name__)


async def seed_reference_user(db: AsyncSession, user: User, member: FamilyMember, force: bool = False) -> None:
    if user.identifier.strip().lower() != REFERENCE_EMAIL:
        return
    if not user.family_id:
        logger.warning("seed_reference_user: user has no family_id")
        return
    pub_result = await db.execute(select(Publication).where(Publication.family_id == user.family_id))
    pub_list = list(pub_result.scalars().all())
    if force:
        for p in pub_list:
            await db.delete(p)
        await db.commit()
        pub_list = []
    elif len(pub_list) >= 7:
        return
    member_count = await db.execute(select(FamilyMember).where(FamilyMember.family_id == user.family_id))
    existing_count = len(member_count.scalars().all())
    members_to_add = FAMILY_MEMBERS if existing_count < 50 else []
    for fm in members_to_add:
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
    participant_ids = [str(m.id) for m in all_members if m.id != author.id][:50]
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
        url = _photo_url(pub_data, pub_data.get("photo_seed", i + 1))
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
