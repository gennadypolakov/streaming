<!DOCTYPE html>
<html lang="ru">
<head>
	<link rel="stylesheet" href="/landing/styles/main.css">
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" user-scalable="no">
	<title><?=$router->page['title']?></title>
	<link href="https://fonts.googleapis.com/css?family=Rubik:300,400,500&amp;subset=cyrillic" rel="stylesheet">
	<link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
</head>
<body>
	<main>
		<header id="header" class="navbar">
			<div class="w-limit">
				<div class="navbar__left">
					<div class="navbar__logo">
						<img id="logo" src="/landing/assets/logo-white.svg" alt="logo">
					</div>
					<div class="navbar__brandname">
						<span class="brandname">StreamVi</span>
					</div>
				</div>
				<div class="navbar__right">
					<div class="navbar__top-button">
						<a class="button" href="http://streamvi.ru">Войти</a>
					</div>
				</div>
			</div>
		</header>
		<section class="main-wrapper">
			<div class="wrapper">
				<div class="gradient"></div>
				<div class="svg-bg"></div>
				<div class="svg-border"></div>
				<section class="face container">
					<div class="face__image">
						<img src="/landing/assets/stream.svg" alt="main-image">
					</div>
					<div class="face__description">
						<div class="wrapper first">
							<span class="big-brandname">StreamVi</span>
							<p>сервис ретрансляции видеоконтента</p>
						</div>
						<div class="wrapper">
							<a class="button" href="http://streamvi.ru">Подробнее</a>
						</div>
					</div>
				</section>
			</div>
			<section class="features">
				<div class="features__n container">
					<div class="features__description">
						<h2>Биржа трансляций</h2>
						<p>Биржа позволяет пользователям приобретать время для проведения своих трансляций на чужих каналах, либо продавать время для трансляций на своих.</p>
						<a href="http://streamvi.ru">Попробовать ></a>
					</div>
					<div class="features__image">
						<img src="/landing/assets/shop2.svg" alt="shop">
					</div>
				</div>
				<div class="features__n container">
					<div class="features__image">
						<img src="/landing/assets/camera.svg" alt="multichanel">
					</div>
					<div class="features__description">
						<h2>Мультиканальные трансляции</h2>
						<p>Позволяют транслировать видео сразу в несколько каналов одновременно.</p>
						<a href="http://streamvi.ru">Попробовать ></a>
					</div>
				</div>
				<div class="features__n container">
					<div class="features__description">
						<h2>Планировщик трансляций</h2>
						<p>Дает возможность запланировать заранее записанное видео или трансляцию на определенное время.</p>
						<a href="http://streamvi.ru">Попробовать ></a>
					</div>
					<div class="features__image">
						<img src="/landing/assets/planer.svg" alt="planer">
					</div>
				</div>
			</section>
			<section class="price-table container">
				<h2>Тарифная система</h2>
				<div class="price-table__wrapper">
					<div class="price-table__input">
						<span>Количество каналов:</span>
						<input id="price-input" type="text" value="3">
						<div id="slider"></div>
					</div>
					<div class="price-table__result">
						<p>Каждый следующий канал уменьшает стоимость на 3%!*</p>
						<div id="result">849p</div>
					</div>
				</div>
				<p class="spoiler">
					*не более чем на 51%
				</p>
			</section>
		</section>
		<footer>
			<p>StreamVi @ <?php echo date('Y');?></p>
		</footer>
	</main>
	<script type="text/javascript" src="/landing/js/nouislider.min.js"></script>
	<script src="/landing/js/main.js"></script>
</body>
</html>