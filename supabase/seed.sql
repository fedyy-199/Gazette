-- Gazette Seed Data: Default Active Sources
-- Refer to AGENTS.md Sections 7, 8, 9, 11

INSERT INTO sources (name, listing_url, parser_strategy, is_active, logo_url)
VALUES
  (
    'Reuters',
    'https://www.reuters.com',
    'reuters',
    true,
    'https://www.reuters.com/pf/resources/images/reuters/logo-vertical-default-512x512.png'
  ),
  (
    'NPR',
    'https://www.npr.org',
    'npr',
    true,
    'https://media.npr.org/images/favicon/favicon-180x180.png'
  ),
  (
    'BBC News',
    'https://www.bbc.com/news',
    'bbc',
    true,
    'https://static.files.bbci.co.uk/core/website/assets/static/icons/touch/apple-touch-icon-180x180.png'
  ),
  (
    'The Guardian',
    'https://www.theguardian.com/us',
    'guardian',
    true,
    'https://assets.guim.co.uk/images/favicons/023dafadbfb00c1b0a9c395ec63e4701/152x152.png'
  ),
  (
    'AP News',
    'https://apnews.com',
    'ap',
    true,
    'https://apnews.com/assets/favicon/apple-touch-icon.png'
  ),
  (
    'Fox News',
    'https://www.foxnews.com',
    'fox',
    true,
    'https://static.foxnews.com/static/orion/styles/img/fox-news/favicons/apple-touch-icon-180x180.png'
  )
ON CONFLICT DO NOTHING;
