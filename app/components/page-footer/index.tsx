const PageFooter = () => {
    return (
        <footer className="flex items-center justify-between pt-6 pb-2">
            <p className="text-muted-theme text-xs">
                © 2026, made with{' '}
                <span className="text-red-500">♥</span>
                {' '}by{' '}
                <span className="font-semibold text-foreground">Credlanche</span>
                {' '}for a better web.
            </p>
            <nav className="flex items-center gap-5">
                {['Credlanche', 'About Us', 'Blog', 'License'].map((link) => (
                    <a
                        key={link}
                        href="#"
                        className="text-muted-theme text-xs hover:text-foreground transition-colors"
                    >
                        {link}
                    </a>
                ))}
            </nav>
        </footer>
    )
}

export default PageFooter
