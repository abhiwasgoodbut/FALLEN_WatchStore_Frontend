function AnnouncementBar() {
  const announcements = [
    "Free Shipping on orders above ₹5,000",
    "✦",
    "100% Authentic Timepieces",
    "✦",
    "COD Available on Select Products",
    "✦",
    "Easy 7-Day Returns",
    "✦",
    "Free Shipping on orders above ₹5,000",
    "✦",
    "100% Authentic Timepieces",
    "✦",
    "COD Available on Select Products",
    "✦",
    "Easy 7-Day Returns",
    "✦",
  ]

  return (
    <div className="announcement-bar">
      <div className="announcement-bar__track">
        {announcements.map((text, index) => (
          <span key={index} className="announcement-bar__item">
            {text === "✦" ? <span>{text}</span> : text}
          </span>
        ))}
        {announcements.map((text, index) => (
          <span key={`dup-${index}`} className="announcement-bar__item">
            {text === "✦" ? <span>{text}</span> : text}
          </span>
        ))}
      </div>
    </div>
  )
}

export default AnnouncementBar
