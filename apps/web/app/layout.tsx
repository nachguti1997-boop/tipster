export const metadata = {
    title: 'Tipster',
    description: 'Propinas por QR',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body>{children}</body>
        </html>
    );
}
