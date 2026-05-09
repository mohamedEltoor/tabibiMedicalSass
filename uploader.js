const http = require('http');
const fs = require('fs');
const path = require('path');

const screenshotsDir = path.join(__dirname, 'docs', 'screenshots');
const tempDir = path.join(screenshotsDir, 'temp');

if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
}

const requiredImages = [
    { id: 'search-results', desc: 'صفحة البحث الرئيسية' },
    { id: 'mobile-home', desc: 'تجربة الموبايل (التطبيق)' },
    { id: 'public-profile-5', desc: 'بروفايل الطبيب (الجزء العلوي)' },
    { id: 'booking-2', desc: 'نافذة حجز موعد (المريض)' },
    { id: 'public-profile-3', desc: 'نافذة كتابة التقييم' },
    { id: 'profile-setup-2', desc: 'إعداد الملف الطبي (للطبيب)' },
    { id: 'profile-setup-3', desc: 'اختيار الأعراض والخدمات' },
    { id: 'clinic-setup-1', desc: 'موقع العيادة على الخريطة' },
    { id: 'clinic-setup-2', desc: 'إعداد المواعيد (الجدول)' },
    { id: 'clinic-setup-3', desc: 'إضافة فروع للعيادة' },
    { id: 'seo-preview-1', desc: 'التسويق الذكي SEO' },
    { id: 'dashboard-1', desc: 'لوحة التحكم الرئيسية (الإيرادات)' },
    { id: 'dashboard-4', desc: 'الإشعارات التفاعلية' },
    { id: 'staff-2', desc: 'صلاحيات الموظفين (RBAC)' },
    { id: 'emr-5', desc: 'سجل جميع المرضى' },
    { id: 'emr-3', desc: 'نافذة تسجيل حالة طبية' },
    { id: 'emr-1', desc: 'ملف المريض والسجل الطبي EMR' },
    { id: 'admin-dashboard', desc: 'لوحة الإدارة الرئيسية (اختياري)' },
    { id: 'admin-approvals', desc: 'موافقات الأطباء (اختياري)' }
];

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        let tempFiles = [];
        if (fs.existsSync(tempDir)) {
            tempFiles = fs.readdirSync(tempDir).filter(f => f.endsWith('.png'));
            // Sort by creation time so the newest uploads are roughly at the bottom or ordered.
            tempFiles.sort((a, b) => {
                const statA = fs.statSync(path.join(tempDir, a));
                const statB = fs.statSync(path.join(tempDir, b));
                return statA.mtime.getTime() - statB.mtime.getTime();
            });
        }

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        let html = `
        <html dir="rtl">
        <head>
            <title>رافع الصور الذكي</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f4f8; padding: 20px; margin: auto; }
                .container { display: flex; gap: 20px; }
                .gallery { width: 45%; background: white; padding: 15px; border-radius: 8px; height: 85vh; overflow-y: auto; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .mapping { width: 55%; background: white; padding: 15px; border-radius: 8px; height: 85vh; overflow-y: auto; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .img-thumb { width: 100%; border: 4px solid transparent; cursor: pointer; margin-bottom: 10px; border-radius: 4px; transition: 0.2s; box-sizing: border-box; }
                .img-thumb:hover { border-color: #007bff; }
                .img-thumb.selected { border-color: #28a745; border-width: 6px; box-shadow: 0 0 10px rgba(40,167,69,0.5); }
                .card { background: #f8f9fa; border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: 0.2s; }
                .card:hover { background: #e9ecef; border-color: #007bff; }
                .card.done { background: #d4edda; border-color: #c3e6cb; }
                h3 { margin: 0; color: #333; font-size: 16px; }
                .header { text-align: center; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>أداة الربط الذكية للصور 🚀</h2>
                <p>1. اضغط على أي صورة من اليمين لتحديدها (ستظهر بحدود خضراء).<br>2. ثم اضغط على الزر المناسب لها في اليسار لربطها!</p>
            </div>
            <div class="container">
                <div class="gallery">
                    <h3 style="margin-bottom: 15px; border-bottom: 2px solid #ddd; padding-bottom: 10px;">الصور التي قمت برفعها (اختر واحدة):</h3>
                    <div id="image-list">
                        ${tempFiles.map(f => `<img src="/image/${f}" class="img-thumb" onclick="selectImage(this, '${f}')">`).join('')}
                    </div>
                </div>
                <div class="mapping">
                    <h3 style="margin-bottom: 15px; border-bottom: 2px solid #ddd; padding-bottom: 10px;">انقر هنا للربط (بعد اختيار الصورة):</h3>
                    <div id="cards">`;
        
        requiredImages.forEach(img => {
            const exists = fs.existsSync(path.join(screenshotsDir, img.id + '.png'));
            html += `
                <div class="card ${exists ? 'done' : ''}" onclick="mapSelectedImage('${img.id}')" id="card-${img.id}">
                    <h3>${img.desc}</h3>
                    <span id="status-${img.id}">${exists ? '✅ مربوطة' : '⏳ تنتظر الربط'}</span>
                </div>`;
        });

        html += `
                    </div>
                </div>
            </div>
            <script>
                let selectedFileName = null;
                let selectedImgElement = null;

                function selectImage(imgElement, fileName) {
                    if (selectedImgElement) selectedImgElement.classList.remove('selected');
                    imgElement.classList.add('selected');
                    selectedImgElement = imgElement;
                    selectedFileName = fileName;
                }

                function mapSelectedImage(id) {
                    if (!selectedFileName) {
                        alert('الرجاء الضغط على صورة من القائمة اليمنى أولاً لتحديدها!');
                        return;
                    }
                    fetch('/map', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: id, fileName: selectedFileName })
                    }).then(() => {
                        const card = document.getElementById('card-' + id);
                        card.classList.add('done');
                        document.getElementById('status-' + id).textContent = '✅ مربوطة بنجاح';
                        
                        // Hide mapped image
                        if (selectedImgElement) {
                            selectedImgElement.style.display = 'none';
                            selectedImgElement = null;
                            selectedFileName = null;
                        }
                    });
                }
            </script>
        </body>
        </html>`;
        res.end(html);
    } else if (req.method === 'GET' && req.url.startsWith('/image/')) {
        const fileName = req.url.replace('/image/', '');
        const filePath = path.join(tempDir, fileName);
        if (fs.existsSync(filePath)) {
            res.writeHead(200, { 'Content-Type': 'image/png' });
            res.end(fs.readFileSync(filePath));
        } else {
            res.writeHead(404);
            res.end();
        }
    } else if (req.method === 'POST' && req.url === '/map') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                const source = path.join(tempDir, payload.fileName);
                const dest = path.join(screenshotsDir, payload.id + '.png');
                if (fs.existsSync(source)) {
                    fs.copyFileSync(source, dest);
                    res.writeHead(200);
                    res.end('OK');
                } else {
                    res.writeHead(404);
                    res.end();
                }
            } catch (e) {
                res.writeHead(500);
                res.end();
            }
        });
    }
});

server.listen(4000, () => {
    console.log('✅ الأداة الذكية جاهزة! افتح http://localhost:4000');
});
