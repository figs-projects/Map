const breakingDiv = document.getElementById('breaking');
const majorDiv = document.getElementById('major');

const feeds = [
  {
    name: "ABC News",
    url: "https://www.abc.net.au/news/feed/51120/rss.xml"
  },
  {
    name: "SBS News",
    url: "https://www.sbs.com.au/news/topic/rss.xml"
  }
];

feeds.forEach(feed => {
  fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`)
    .then(res => res.json())
    .then(data => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(data.contents, "text/xml");
      const items = xml.querySelectorAll("item");

      items.forEach((item, i) => {
        if (i > 3) return;

        const title = item.querySelector("title").textContent;
        const link = item.querySelector("link").textContent;

        const div = document.createElement("div");
        div.className = "news-item";
        div.innerHTML = `<a href="${link}" target="_blank">${title}</a><br><small>${feed.name}</small>`;

        breakingDiv.appendChild(div);
      });
    });
});
