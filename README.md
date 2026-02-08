# SalesUP Dashboard

## Despliegue rápido

### Paso 1: Subir a GitHub
```bash
cd salesup-dashboard
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/salesup-dashboard.git
git push -u origin main
```

### Paso 2: Cloudflare Pages
1. Ve a https://dash.cloudflare.com → Workers & Pages → Create → Pages
2. Conecta tu repo de GitHub
3. Configuración de build:
   - **Framework preset**: None
   - **Build command**: `npm install && npm run build`
   - **Build output directory**: `dist`
4. Deploy → Tu dashboard estará en: `salesup-dashboard.pages.dev`

### Paso 3: Google Sheets API (para datos en tiempo real)
1. Ve a https://console.cloud.google.com
2. Crea un proyecto nuevo (ej: "salesup-dashboard")
3. Habilita "Google Sheets API"
4. Ve a IAM → Service Accounts → Crear cuenta de servicio
5. Crea una key JSON y descárgala
6. Comparte tu Google Sheet con el email de la service account (como Editor)

### Paso 4: Cloudflare Worker (proxy seguro)
```bash
cd worker
npx wrangler login
npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_KEY
# (pega todo el contenido del JSON de la service account)
npx wrangler secret put SHEET_ID
# (pega el ID de tu Google Sheet - es la parte de la URL entre /d/ y /edit)
npx wrangler deploy
```

Tu Worker estará en: `salesup-sheets-proxy.TU_SUBDOMAIN.workers.dev`
