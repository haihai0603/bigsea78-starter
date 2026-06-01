import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  const locale = 'zh'; // Default locale, can be dynamic based on request

  return {
    locale,
    messages: (await import(`./locale/messages/${locale}/common.json`)).default,
  };
});
