import { site } from '@/site/config';

export function Footer() {
  return (
    <footer className='border-t mt-20'>
      <div className='container mx-auto px-4 py-8'>
        <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
          <div className='flex flex-col md:flex-row items-center gap-2 md:gap-4'>
            <span className='text-sm font-semibold'>{site.name}</span>
            <span className='text-sm text-muted-foreground'>&copy; {new Date().getFullYear()} {site.footer.copyright}</span>
          </div>
          <div className='flex gap-4'>
            {site.footer.links.map((link) => (
              <a key={link.href} href={link.href} className='text-sm text-muted-foreground hover:text-foreground transition-colors'>
                {link.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
