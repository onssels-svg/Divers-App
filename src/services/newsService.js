import axios from 'axios';

export async function getNews(query, pageSize = 5) {
  const res = await axios.get('/api/news', {
    params: { q: query, pageSize },
  });
  return res.data?.articles || [];
}
