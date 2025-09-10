"use strict";

"use strict";

window.addEventListener('DOMContentLoaded', () => {

	// =======================================
	// ФУНКЦИЯ ОТПРАВКИ ЗАКАЗА В FORMSPREE
	// =======================================
	function sendOrderToFormspree(cart, totalAmount) {
		console.log('📤 Отправка заказа в Formspree...');

		const formData = new FormData();

		// Добавляем общую информацию о заказе
		formData.append('Сумма заказа', totalAmount + ' грн');
		formData.append('Дата заказа', new Date().toLocaleString('ru-RU'));
		formData.append('Количество товаров', cart.length + ' шт.');
		formData.append('Общая сумма', totalAmount + ' грн');

		// Добавляем информацию о каждом товаре
		cart.forEach((item, index) => {
			const itemTotal = (item.price * item.quantity).toFixed(2);

			formData.append(`Товар ${index + 1} - Название`, item.name || 'Без названия');
			formData.append(`Товар ${index + 1} - Цена за шт.`, item.price + ' грн');
			formData.append(`Товар ${index + 1} - Количество`, item.quantity + ' шт.');
			formData.append(`Товар ${index + 1} - Сумма`, itemTotal + ' грн');
			formData.append(`Товар ${index + 1} - Изображение`, item.img || 'Нет изображения');
		});

		// Отправляем на Formspree
		fetch('https://formspree.io/f/xpwjbozp', {
			method: 'POST',
			body: formData,
			headers: {
				'Accept': 'application/json'
			}
		})
			.then(response => {
				if (response.ok) {
					return response.json();
				}
				throw new Error('Ошибка сети при отправке заказа');
			})
			.then(data => {
				console.log('✅ Заказ успешно отправлен в Formspree:', data);
				showNotification('Заказ успешно оформлен! Мы свяжемся с вами в ближайшее время.');
			})
			.catch(error => {
				console.error('❌ Ошибка отправки заказа:', error);
				showNotification('Произошла ошибка при отправке заказа. Пожалуйста, попробуйте еще раз.', 'error');
			});
	}

	// =======================================
	// ОБНОВЛЕННЫЙ ОБРАБОТЧИК КНОПКИ ОФОРМЛЕНИЯ ЗАКАЗА
	// =======================================
	document.querySelector('.checkout-btn').addEventListener('click', function () {
		const cart = JSON.parse(localStorage.getItem('cart')) || [];
		const totalAmount = document.querySelector('.total-amount').textContent;

		if (cart.length === 0) {
			alert('Корзина пуста!');
			return;
		}

		// Подтверждение оформления заказа
		if (confirm(`Оформить заказ на сумму ${totalAmount} грн?`)) {
			// Отправляем заказ в Formspree
			sendOrderToFormspree(cart, totalAmount);

			console.log('✅ Заказ оформлен:', cart);
			showNotification('Заказ оформлен! Ожидайте подтверждения.');

			// Очищаем корзину после оформления
			localStorage.removeItem('cart');

			// Обновляем отображение
			loadCart();
		}
	});

	// =======================================
	// ОБРАБОТЧИК КНОПКИ ОЧИСТКИ КОРЗИНЫ
	// =======================================
	document.querySelector('.clear-corzina').addEventListener('click', function () {
		const cart = JSON.parse(localStorage.getItem('cart')) || [];

		if (cart.length === 0) {
			alert('Корзина уже пуста!');
			return;
		}

		if (confirm('Вы уверены, что хотите полностью очистить корзину?')) {
			localStorage.removeItem('cart');
			loadCart();
			showNotification('Корзина очищена!');
		}
	});

	// Остальной ваш код остается без изменений...
	// [Здесь остается весь ваш оригинальный код: loadCart, updateQuantity, removeItem, showNotification и т.д.]

});


// Почему именно на родительский блок:
// ✅ Более эффективно - обрабатывает события только в пределах корзины
// ✅ Безопаснее - не ловит клики по другим элементам страницы
// ✅ Производительнее - меньше проверок в обработчике
// ✅ Логичнее - события корзины обрабатываются в контейнере корзины


// Как работает текущее решение:
// Один обработчик на контейнер корзины
// Проверка: e.target.closest('.cart-item') - находим товар по которому кликнули
// Проверка: e.target.dataset.action - определяем какое действие нужно выполнить
// Действие: вызываем соответствующую функцию

// Преимущества такого подхода:
// Работает с динамическими элементами - новые товары автоматически обрабатываются
// Экономит память - один обработчик вместо многих
// Легко поддерживать - вся логика в одном месте
// Автоматически удаляется при удалении контейнера


//    отправка формы не вирт сервер

// Что было добавлено:
// Функция sendOrderToFormspree() - отправляет данные корзины на ваш Formspree endpoint
// Обновленный обработчик кнопки оформления заказа - теперь вызывает функцию отправки
// Обработчик кнопки очистки корзины - с подтверждением и уведомлением

// Особенности реализации:
// ✅ Данные отправляются в удобном формате для чтения
// ✅ Включает всю информацию о товарах(название, цена, количество, сумма)
// ✅ Добавлена обработка ошибок
// ✅ Сообщения об успешной / неуспешной отправке
// ✅ Совместимо с вашей существующей структурой данных



// ..................   ПОЛНАЯ ОЧИСТКА КОРЗИНЫ ЧЕРЕЗ КНОПКУ  .......................................



document.querySelector('.clear-corzina').addEventListener('click', () => {
	if (confirm('Вы уверены, что хотите очистить корзину?')) {
		localStorage.removeItem('cart');
		loadCart(); // Обновляем отображение
		alert('Корзина очищена!');
	}
});