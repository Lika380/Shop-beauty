export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-col">
          <p className="footer-brand">Shop Beauty</p>
          <p className="footer-text">
            Магазин оригинальной косметики и парфюмерии.
            <br />
            ТОО «Shop Beauty», г. Алматы, Казахстан.
          </p>
        </div>

        <div className="footer-col">
          <p className="footer-heading">Контакты</p>
          <p className="footer-text">г. Алматы, ул. Достык, 89, ТРЦ «Dostyk Plaza», 2 этаж</p>
          <p className="footer-text">+7 (727) 355-14-82</p>
          <p className="footer-text">hello@shopbeauty.kz</p>
        </div>

        <div className="footer-col">
          <p className="footer-heading">Режим работы</p>
          <p className="footer-text">Пн–Вс: 10:00–21:00</p>
          <p className="footer-text">Без выходных</p>
        </div>

        <div className="footer-col">
          <p className="footer-heading">Мы в соцсетях</p>
          <div className="footer-social">
            <span>Instagram</span>
            <span>WhatsApp</span>
            <span>Telegram</span>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© 2026 ТОО «Shop Beauty». БИН 261140004521. Все права защищены.</p>
      </div>
    </footer>
  );
}
