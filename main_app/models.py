from django.db import models

class Report(models.Model):
    title = models.CharField(max_length=200)  # Judul laporan
    category = models.CharField(max_length=100)  # Kategori laporan
    description = models.TextField()  # Deskripsi laporan
    location = models.CharField(max_length=200)  # Lokasi laporan
    status = models.CharField(
        max_length=20,
        default='REPORTED',  # Status default
    )
    created_at = models.DateTimeField(auto_now_add=True)  # Tanggal pembuatan laporan

    def __str__(self):
        return self.title