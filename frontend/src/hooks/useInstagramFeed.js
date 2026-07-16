import { useState, useEffect } from 'react';

export function useInstagramFeed(limit = 8) {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstagramFeed = async () => {
      const token = import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN;
      
      if (!token) {
        setError('No Instagram Access Token found. Please add VITE_INSTAGRAM_ACCESS_TOKEN to your .env file.');
        setLoading(false);
        return;
      }

      try {
        const url = `https://graph.instagram.com/me/media?fields=id,media_type,media_url,permalink,caption&access_token=${token}&limit=${limit * 2}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error?.message || 'Failed to fetch Instagram feed');
        }

        const data = await response.json();
        
        // Filter out videos if we only want images/carousels for the grid
        const imagePosts = data.data
          .filter(post => post.media_type === 'IMAGE' || post.media_type === 'CAROUSEL_ALBUM')
          .slice(0, limit);
          
        setFeed(imagePosts);
      } catch (err) {
        console.error('Error fetching Instagram feed:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInstagramFeed();
  }, [limit]);

  return { feed, loading, error };
}
