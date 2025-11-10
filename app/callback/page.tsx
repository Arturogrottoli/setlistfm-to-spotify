export default function CallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="max-w-2xl mx-auto p-8 text-center space-y-4">
        <h1 className="text-3xl font-bold">Autorización exitosa</h1>
        <p className="text-muted-foreground">
          Copia el código de la URL de esta página (después de <code className="bg-muted px-2 py-1 rounded">code=</code>
          ) y pégalo en la aplicación.
        </p>
        <p className="text-sm text-muted-foreground">Puedes cerrar esta pestaña después de copiar el código.</p>
      </div>
    </div>
  )
}
