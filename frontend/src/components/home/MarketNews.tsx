import { API_BASE_URL } from "../../config";
import { useEffect, useState } from "react";

function MarketNews() {
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    async function loadNews() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/news`);
        const data = await res.json();

        if (data.success) {
          setArticles(data.articles);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadNews();
  }, []);

  return (
    <section className="mx-auto mt-16 max-w-7xl px-6 text-left w-full">
      <h2 className="mb-6 text-3xl font-bold text-slate-900 dark:text-white">
        Latest Market News
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        {articles.slice(0, 6).map((article, index) => (
          <a
            key={index}
            href={article.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition hover:shadow-md block text-slate-900 dark:text-slate-100"
          >
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {article.title}
            </h3>

            <p className="mt-3 text-slate-600 dark:text-slate-400">
              {article.description}
            </p>

            <p className="mt-4 text-sm font-semibold text-blue-600 dark:text-blue-400">
              Read full article →
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}

export default MarketNews;
