## ============================================================================
## TUGAS 1 - ANALISIS JALUR (PATH ANALYSIS)
## ----------------------------------------------------------------------------
## Judul Kajian   : Pengaruh Kualitas Produk dan Harga terhadap Loyalitas
##                  Konsumen melalui Kepuasan Konsumen
## Variabel       :
##   X1 = Kualitas Produk      (eksogen)
##   X2 = Harga                (eksogen)
##   Y1 = Kepuasan Konsumen    (mediator / endogen antara)
##   Y2 = Loyalitas Konsumen   (endogen / variabel akhir)
##
## Catatan: penamaan variabel di atas mengikuti Kasus 3 pada modul
## "Analisis Data dengan R" Bab 21 (struktur data identik: X1, X2, Y1, Y2).
## Jika bidang Saudara berbeda, cukup ubah 4 baris label pada bagian
## "0. KONFIGURASI & LABEL VARIABEL" di bawah -- seluruh isi skrip (termasuk
## laporan PDF) akan menyesuaikan otomatis.
##
## OUTPUT AKHIR: skrip ini akan menghasilkan satu file
##   "Laporan_Analisis_Jalur.pdf"
## di folder kerja, berisi:
##   1. Tujuan Penelitian
##   2. Model Jalur yang Digunakan (persamaan struktural + diagram jalur)
##   3. Simpulan Hasil Analisis Jalur
##   4. Lampiran: skrip R lengkap + output analisis (lavaan) + tabel koefisien
##
## CATATAN VERSI: laporan PDF disusun lewat R Markdown -> pandoc -> LaTeX
## (paket rmarkdown + tinytex), BUKAN digambar manual pakai grid seperti versi
## sebelumnya. Hasilnya margin konsisten & tipografi jauh lebih rapi karena
## memakai mesin tata-letak dokumen (LaTeX) yang sudah teruji, bukan koordinat
## yang dihitung manual. Prasyarat: pandoc (biasanya sudah ada bila dijalankan
## lewat RStudio) dan LaTeX/tinytex (akan dipasang otomatis sekali saja bila
## belum ada, lihat Bagian 9).
##
## CATATAN UPGRADE VISUAL: seluruh grafik kini memakai satu sistem desain yang
## konsisten (Bagian 0b) -- palet kategorikal biru/oranye/aqua & palet diverging
## biru<->merah yang sudah divalidasi ramah buta warna, ditambah satu fungsi
## tema (`tema_laporan()`) yang dipakai di semua chart ggplot2 supaya tipografi,
## grid, dan jarak antarelemen seragam. Heatmap korelasi kini hanya menampilkan
## segitiga bawah (matriks simetris, separuh sudah cukup informatif) dan diagram
## jalur menambahkan nilai R^2 pada variabel mediator & endogen -- informasi
## penting yang sebelumnya tidak tervisualisasikan.
##
## Struktur skrip:
##   0. Konfigurasi & label variabel
##   0b. Sistem desain visual (palet warna & tema ggplot2 bersama)
##   1. Persiapan paket
##   2. Membaca data
##   3. Statistik deskriptif & eksplorasi visual (heatmap korelasi, scatter matrix)
##   4. Spesifikasi & estimasi model jalur (lavaan)
##   5. Ringkasan hasil (langsung, tidak langsung, total, R^2, uji signifikansi)
##   6. Visualisasi diagram jalur (custom, dengan pewarnaan & ketebalan garis)
##   7. Visualisasi dekomposisi efek (bar chart langsung vs tidak langsung vs total)
##   8. Narasi simpulan otomatis (dibangun dari angka hasil model)
##   9. Menyusun & mengekspor LAPORAN AKHIR dalam format PDF (R Markdown + LaTeX)
## ============================================================================


## ----------------------------------------------------------------------------
## 0. KONFIGURASI & LABEL VARIABEL
## ----------------------------------------------------------------------------

# --- Folder kerja & file data (SESUAIKAN JIKA LOKASI BERBEDA) ---------------
folder_kerja <- "D:/0. S3 PROJECT/MODEL PERSAMAAN STRUKTURAL/Tugas 1"
nama_file    <- "DataPathProyek2.xlsx - Sheet 1.csv"
nama_skrip   <- "Tugas1_PathAnalysis.R"   # nama file skrip ini (untuk dilampirkan di PDF)

setwd(folder_kerja)

# --- Label variabel untuk laporan & visual (ubah di sini bila perlu) -------
label_var <- c(
  X1 = "Kualitas Produk",
  X2 = "Harga",
  Y1 = "Kepuasan Konsumen",
  Y2 = "Loyalitas Konsumen"
)

judul_penelitian <- "Pengaruh Kualitas Produk dan Harga terhadap Loyalitas Konsumen melalui Kepuasan Konsumen"


## ----------------------------------------------------------------------------
## 0b. SISTEM DESAIN VISUAL (dipakai bersama oleh seluruh grafik di skrip ini)
## ----------------------------------------------------------------------------
## Palet kategorikal (peran variabel) & diverging (tanda koefisien) di bawah
## diambil dari urutan hue yang sudah diuji lolos ambang jarak warna CVD
## (deuteranopia/protanopia) -- bukan sekadar warna "kelihatan bagus", tapi
## tetap terbedakan bagi pembaca buta warna. Semua chart memakai palet & tema
## yang sama supaya laporan terasa satu sistem visual, bukan tempelan beberapa
## gaya berbeda.

# --- Warna peran variabel (kategorikal, urutan tetap) -----------------------
warna_eksogen  <- "#2A78D6"   # biru   -> X1, X2 (variabel eksogen)
warna_mediator <- "#EB6834"   # oranye -> Y1 (mediator, sengaja ditonjolkan)
warna_endogen  <- "#1BAF7A"   # aqua   -> Y2 (endogen akhir)

# --- Warna tanda koefisien (diverging, konsisten dipakai di heatmap & jalur) -
warna_positif  <- "#2A78D6"   # biru -> koefisien/korelasi positif
warna_negatif  <- "#E34948"   # merah -> koefisien/korelasi negatif
warna_netral   <- "#F0EFEC"   # abu-abu -> titik tengah skala diverging (r = 0)

# --- Warna tinta & latar (tipografi & chrome grafik) -------------------------
warna_ink            <- "#0B0B0B"   # teks utama (judul)
warna_ink_sekunder    <- "#52514E"   # teks sekunder (subjudul, badan)
warna_ink_muted       <- "#898781"   # teks pendukung (sumbu, catatan kaki)
warna_grid            <- "#E1E0D9"   # garis bantu (gridline tipis)
warna_surface         <- "#FCFCFB"   # latar panel/plot

font_dasar  <- "sans"   # font sistem; ganti mis. "Helvetica" bila tersedia
dpi_ekspor  <- 320       # resolusi ekspor PNG (lebih tajam saat dicetak)

# --- Tema ggplot2 bersama: satu sumber kebenaran untuk tipografi & grid -----
tema_laporan <- function(base_size = 12, judul_size = base_size + 3) {
  theme_minimal(base_size = base_size, base_family = font_dasar) +
    theme(
      plot.title       = element_text(face = "bold", size = judul_size,
                                       color = warna_ink, margin = margin(b = 4)),
      plot.subtitle    = element_text(size = base_size - 2,
                                       color = warna_ink_sekunder, margin = margin(b = 10)),
      plot.caption     = element_text(size = base_size - 3.5, color = warna_ink_muted,
                                       hjust = 0, margin = margin(t = 8)),
      axis.title       = element_text(color = warna_ink_sekunder, size = base_size - 1),
      axis.text        = element_text(color = warna_ink_muted, size = base_size - 2),
      panel.grid.major = element_line(color = warna_grid, linewidth = 0.35),
      panel.grid.minor = element_blank(),
      legend.title     = element_text(color = warna_ink_sekunder, size = base_size - 1, face = "bold"),
      legend.text      = element_text(color = warna_ink_sekunder, size = base_size - 2),
      legend.position  = "top",
      plot.background  = element_rect(fill = warna_surface, color = NA),
      panel.background = element_rect(fill = warna_surface, color = NA),
      plot.margin      = margin(14, 16, 10, 14)
    )
}


## ----------------------------------------------------------------------------
## 1. PERSIAPAN PAKET
## ----------------------------------------------------------------------------

paket_dibutuhkan <- c(
  "readr", "dplyr", "tidyr",              # manajemen data
  "lavaan",                               # analisis jalur / SEM
  "ggplot2",                              # visualisasi umum
  "DiagrammeR", "DiagrammeRsvg", "rsvg",  # diagram jalur kustom
  "gridExtra",                            # scatter matrix ringan
  "rmarkdown", "knitr", "tinytex"         # penyusunan laporan akhir (PDF rapi via LaTeX)
)

paket_belum_ada <- paket_dibutuhkan[!paket_dibutuhkan %in% installed.packages()[, "Package"]]
if (length(paket_belum_ada) > 0) install.packages(paket_belum_ada, dependencies = TRUE)

invisible(lapply(paket_dibutuhkan, library, character.only = TRUE))
library(grid)  # bagian dari base R, tidak perlu instalasi


## ----------------------------------------------------------------------------
## 2. MEMBACA DATA
## ----------------------------------------------------------------------------

data <- readr::read_csv(file.path(folder_kerja, nama_file), show_col_types = FALSE)

# Pastikan hanya kolom X1, X2, Y1, Y2 yang dipakai & bertipe numerik
data <- data %>%
  select(X1, X2, Y1, Y2) %>%
  mutate(across(everything(), as.numeric)) %>%
  drop_na()

cat("Jumlah responden (n) :", nrow(data), "\n")
cat("Ringkasan data:\n")
print(summary(data))


## ----------------------------------------------------------------------------
## 3. STATISTIK DESKRIPTIF & EKSPLORASI VISUAL
## ----------------------------------------------------------------------------

## 3a. Statistik deskriptif ---------------------------------------------------
deskriptif <- data %>%
  pivot_longer(everything(), names_to = "Variabel", values_to = "Nilai") %>%
  group_by(Variabel) %>%
  summarise(
    Label   = label_var[unique(Variabel)],
    N       = n(),
    Mean    = mean(Nilai),
    SD      = sd(Nilai),
    Min     = min(Nilai),
    Max     = max(Nilai),
    .groups = "drop"
  )
print(deskriptif)
write.csv(deskriptif, "01_Statistik_Deskriptif.csv", row.names = FALSE)

## 3b. Heatmap korelasi (segitiga bawah saja, gradient diverging, direct-labeled)
## Matriks korelasi simetris -> menampilkan kedua segitiga hanya mengulang info
## yang sama dua kali dan membuat chart lebih ramai dari perlu. Segitiga bawah
## + diagonal sudah memuat seluruh informasi.
urutan_var <- unname(label_var[c("X1", "X2", "Y1", "Y2")])

mat_kor <- cor(data)
mat_kor[upper.tri(mat_kor)] <- NA

kor_long <- as.data.frame(as.table(mat_kor))
names(kor_long) <- c("Var1", "Var2", "r")
kor_long <- kor_long[!is.na(kor_long$r), ]
kor_long$Label1 <- factor(label_var[as.character(kor_long$Var1)], levels = rev(urutan_var))
kor_long$Label2 <- factor(label_var[as.character(kor_long$Var2)], levels = urutan_var)

plot_heatmap <- ggplot(kor_long, aes(x = Label2, y = Label1, fill = r)) +
  geom_tile(color = warna_surface, linewidth = 1.4) +
  geom_text(aes(label = sprintf("%.2f", r),
                color = abs(r) > 0.55), size = 5, fontface = "bold", show.legend = FALSE) +
  scale_fill_gradient2(low = warna_negatif, mid = warna_netral, high = warna_positif,
                        midpoint = 0, limits = c(-1, 1), name = "Koefisien\nKorelasi (r)") +
  scale_color_manual(values = c("TRUE" = "white", "FALSE" = warna_ink)) +
  labs(title = "Matriks Korelasi Antarvariabel Penelitian",
       subtitle = judul_penelitian, x = NULL, y = NULL,
       caption = "Diagonal = 1,00. Hanya separuh matriks ditampilkan karena bersifat simetris.") +
  tema_laporan(base_size = 13) +
  theme(
    axis.text.x = element_text(angle = 30, hjust = 1),
    panel.grid  = element_blank(),
    legend.position = "right"
  ) +
  coord_fixed()

ggsave("02_Heatmap_Korelasi.png", plot_heatmap, width = 7, height = 6, dpi = dpi_ekspor)
print(plot_heatmap)

## 3c. Scatterplot matrix ringan (dibangun manual dengan ggplot2 + gridExtra,
##     TANPA dependensi tambahan yang berat seperti GGally) -----------------
pasangan_var <- combn(names(data), 2, simplify = FALSE)

buat_scatter <- function(v) {
  df_plot    <- data.frame(x = data[[v[1]]], y = data[[v[2]]])
  r_val      <- cor(df_plot$x, df_plot$y)
  warna_tren <- if (r_val >= 0) warna_positif else warna_negatif   # arah tren ikut tanda korelasi

  ggplot(df_plot, aes(x = x, y = y)) +
    geom_point(alpha = 0.45, color = warna_ink_sekunder, size = 1.8) +
    geom_smooth(method = "lm", se = FALSE, color = warna_tren, linewidth = 1) +
    annotate("label", x = -Inf, y = Inf, hjust = -0.12, vjust = 1.4,
             label = sprintf("r = %.2f", r_val), size = 3.4, fontface = "bold",
             color = warna_tren, fill = warna_surface, label.size = 0, alpha = 0.9) +
    labs(x = label_var[[v[1]]], y = label_var[[v[2]]]) +
    tema_laporan(base_size = 10) +
    theme(plot.margin = margin(6, 8, 6, 8))
}

daftar_plot_scatter <- lapply(pasangan_var, buat_scatter)

plot_matrix <- gridExtra::arrangeGrob(
  grobs = daftar_plot_scatter, ncol = 3,
  top = grid::textGrob("Sebaran & Hubungan Antarvariabel",
                        gp = grid::gpar(fontsize = 14, fontface = "bold", col = warna_ink))
)

ggsave("03_Scatterplot_Matrix.png", plot_matrix, width = 11, height = 7, dpi = dpi_ekspor)


## ----------------------------------------------------------------------------
## 4. SPESIFIKASI & ESTIMASI MODEL JALUR
## ----------------------------------------------------------------------------

model_jalur <- '
  # --- Persamaan struktural ---
  Y1 ~ a1*X1 + a2*X2
  Y2 ~ b1*X1 + b2*X2 + c*Y1

  # --- Efek tidak langsung (indirect effect) melalui Y1 ---
  IE_X1 := a1*c
  IE_X2 := a2*c

  # --- Efek total (langsung + tidak langsung) ---
  Total_X1 := b1 + IE_X1
  Total_X2 := b2 + IE_X2
'

fit <- sem(model_jalur, data = data)

cat("\n\n============== HASIL ESTIMASI MODEL JALUR ==============\n")
summary(fit, standardized = TRUE, fit.measures = TRUE, rsquare = TRUE)


## ----------------------------------------------------------------------------
## 5. RINGKASAN HASIL (untuk lampiran & bahan simpulan)
## ----------------------------------------------------------------------------

param <- parameterEstimates(fit, standardized = TRUE)

# Beri tanda bintang signifikansi ala jurnal
beri_bintang <- function(p) {
  ifelse(p < 0.001, "***", ifelse(p < 0.01, "**", ifelse(p < 0.05, "*", "ns")))
}

tabel_jalur <- param %>%
  filter(op %in% c("~", ":=")) %>%
  mutate(
    Hubungan = paste(lhs, ifelse(op == "~", "<-", "="), rhs),
    Std_Beta = round(std.all, 3),
    z_hitung = round(z, 3),
    p_value  = round(pvalue, 3),
    Sig      = beri_bintang(pvalue)
  ) %>%
  select(Hubungan, Std_Beta, z_hitung, p_value, Sig)

cat("\nTabel ringkas koefisien jalur (standardized):\n")
print(tabel_jalur, row.names = FALSE)
write.csv(tabel_jalur, "04_Tabel_Koefisien_Jalur.csv", row.names = FALSE)

# Koefisien determinasi (R^2) tiap variabel endogen -- dipakai di diagram jalur
# (Bagian 6) & narasi simpulan (Bagian 8), sekaligus diekspor sebagai lampiran.
r2         <- lavInspect(fit, "rsquare")
r2_Y1      <- unname(round(r2[["Y1"]], 3))
r2_Y2      <- unname(round(r2[["Y2"]], 3))
tabel_r2   <- data.frame(Variabel = c(label_var[["Y1"]], label_var[["Y2"]]), R2 = c(r2_Y1, r2_Y2))
write.csv(tabel_r2, "04b_Koefisien_Determinasi.csv", row.names = FALSE)

# Fungsi bantu ambil satu nilai parameter
ambil <- function(lhs_target, rhs_target = NULL, op_target = "~") {
  if (is.null(rhs_target)) {
    baris <- param[param$lhs == lhs_target & param$op == op_target, ]
  } else {
    baris <- param[param$lhs == lhs_target & param$rhs == rhs_target & param$op == op_target, ]
  }
  list(beta = round(baris$std.all, 3), z = round(baris$z, 3), p = round(baris$pvalue, 3))
}

p_X1_Y1 <- ambil("Y1", "X1")
p_X2_Y1 <- ambil("Y1", "X2")
p_X1_Y2 <- ambil("Y2", "X1")
p_X2_Y2 <- ambil("Y2", "X2")
p_Y1_Y2 <- ambil("Y2", "Y1")
p_IE_X1 <- ambil("IE_X1", op_target = ":=")
p_IE_X2 <- ambil("IE_X2", op_target = ":=")


## ----------------------------------------------------------------------------
## 6. VISUALISASI DIAGRAM JALUR (kustom, DiagrammeR)
## ----------------------------------------------------------------------------
## Prinsip visualisasi yang diterapkan:
##  - Encoding warna semantik: biru = pengaruh positif, merah = negatif
##    (menghindari kebutuhan legenda terpisah / direct labeling), konsisten
##    dengan skema diverging yang sama dipakai di heatmap korelasi (Bagian 3b).
##  - Ketebalan garis (penwidth) proporsional terhadap besar |koefisien
##    standar| -> preattentive attribute untuk menonjolkan jalur dominan.
##  - Tata letak kiri-ke-kanan meniru arah kausalitas, konsisten dgn modul.
##  - Kotak mediator diberi warna berbeda untuk menegaskan perannya.
##  - Nilai R^2 dicantumkan pada kotak Y1 & Y2 sehingga diagram sekaligus
##    menunjukkan seberapa besar variasi tiap variabel endogen yang terjelaskan
##    oleh model -- informasi yang pada versi sebelumnya hanya ada di teks.

warna_jalur <- function(beta) if (beta >= 0) warna_positif else warna_negatif
lebar_jalur <- function(beta) round(1 + abs(beta) * 6, 1)
label_jalur <- function(beta, sig) sprintf("%.3f %s", beta, sig)

e1 <- list(beta = p_X1_Y1$beta, sig = beri_bintang(p_X1_Y1$p))  # X1 -> Y1
e2 <- list(beta = p_X2_Y1$beta, sig = beri_bintang(p_X2_Y1$p))  # X2 -> Y1
e3 <- list(beta = p_X1_Y2$beta, sig = beri_bintang(p_X1_Y2$p))  # X1 -> Y2
e4 <- list(beta = p_X2_Y2$beta, sig = beri_bintang(p_X2_Y2$p))  # X2 -> Y2
e5 <- list(beta = p_Y1_Y2$beta, sig = beri_bintang(p_Y1_Y2$p))  # Y1 -> Y2

dot_diagram <- sprintf('
digraph path_diagram {
  graph [rankdir = LR, splines = curved, bgcolor = "%s", pad = 0.5, nodesep = 0.7, ranksep = 1.2,
         label = "%s\\n ", labelloc = "t", fontname = "Helvetica", fontsize = 16, fontcolor = "%s"]
  node [shape = box, style = "rounded,filled", fontname = "Helvetica", fontsize = 13, fontcolor = white, width = 2.3, height = 0.9, penwidth = 0]

  X1 [label = "%s\\n(X1)", fillcolor = "%s"]
  X2 [label = "%s\\n(X2)", fillcolor = "%s"]
  Y1 [label = "%s\\n(Y1) \u00b7 Mediator\\nR\u00b2 = %.3f", fillcolor = "%s"]
  Y2 [label = "%s\\n(Y2)\\nR\u00b2 = %.3f", fillcolor = "%s"]

  edge [fontname = "Helvetica", fontsize = 12, fontcolor = "%s", arrowsize = 0.85]

  X1 -> Y1 [label = "%s", color = "%s", penwidth = %s]
  X2 -> Y1 [label = "%s", color = "%s", penwidth = %s]
  X1 -> Y2 [label = "%s", color = "%s", penwidth = %s]
  X2 -> Y2 [label = "%s", color = "%s", penwidth = %s]
  Y1 -> Y2 [label = "%s", color = "%s", penwidth = %s]

  { rank = same; X1; X2 }
}
',
  warna_surface, "Diagram Jalur (Path Diagram)", warna_ink,
  label_var["X1"], warna_eksogen,
  label_var["X2"], warna_eksogen,
  label_var["Y1"], r2_Y1, warna_mediator,
  label_var["Y2"], r2_Y2, warna_endogen,
  warna_ink_sekunder,

  label_jalur(e1$beta, e1$sig), warna_jalur(e1$beta), lebar_jalur(e1$beta),
  label_jalur(e2$beta, e2$sig), warna_jalur(e2$beta), lebar_jalur(e2$beta),
  label_jalur(e3$beta, e3$sig), warna_jalur(e3$beta), lebar_jalur(e3$beta),
  label_jalur(e4$beta, e4$sig), warna_jalur(e4$beta), lebar_jalur(e4$beta),
  label_jalur(e5$beta, e5$sig), warna_jalur(e5$beta), lebar_jalur(e5$beta)
)

grafik_jalur <- DiagrammeR::grViz(dot_diagram)
print(grafik_jalur)

# Ekspor diagram jalur ke PNG resolusi tinggi (dipakai ulang di laporan PDF)
svg_kode <- DiagrammeRsvg::export_svg(grafik_jalur)
rsvg::rsvg_png(charToRaw(svg_kode), file = "05_Diagram_Jalur.png", width = 2200, height = 1300)

cat("\nDiagram jalur tersimpan sebagai 05_Diagram_Jalur.png\n")


## ----------------------------------------------------------------------------
## 7. VISUALISASI DEKOMPOSISI EFEK (langsung vs tidak langsung vs total)
## ----------------------------------------------------------------------------

dekomposisi <- data.frame(
  Prediktor = rep(c(label_var["X1"], label_var["X2"]), each = 3),
  Jenis     = factor(rep(c("Langsung", "Tidak Langsung", "Total"), 2),
                      levels = c("Langsung", "Tidak Langsung", "Total")),
  Beta      = c(
    p_X1_Y2$beta, p_IE_X1$beta, p_X1_Y2$beta + p_IE_X1$beta,
    p_X2_Y2$beta, p_IE_X2$beta, p_X2_Y2$beta + p_IE_X2$beta
  )
)

plot_dekomposisi <- ggplot(dekomposisi, aes(x = Prediktor, y = Beta, fill = Jenis)) +
  geom_col(position = position_dodge(width = 0.7), width = 0.6) +
  geom_text(aes(label = sprintf("%.3f", Beta)),
            position = position_dodge(width = 0.7), vjust = -0.4, size = 3.8,
            fontface = "bold", color = warna_ink) +
  geom_hline(yintercept = 0, color = warna_grid, linewidth = 0.6) +
  # Warna dipetakan ke peran variabel yang sama seperti diagram jalur (Bagian 6):
  # biru = pengaruh langsung, oranye = melalui mediator, aqua = total.
  scale_fill_manual(values = c("Langsung" = warna_eksogen, "Tidak Langsung" = warna_mediator,
                                "Total" = warna_endogen)) +
  labs(
    title = "Dekomposisi Pengaruh terhadap Loyalitas Konsumen (Y2)",
    subtitle = "Koefisien jalur terstandarisasi (standardized path coefficient)",
    x = NULL, y = "Koefisien Standar (Beta)", fill = "Jenis Pengaruh"
  ) +
  tema_laporan(base_size = 13)

ggsave("06_Dekomposisi_Efek.png", plot_dekomposisi, width = 7.5, height = 5.5, dpi = dpi_ekspor)
print(plot_dekomposisi)


## ----------------------------------------------------------------------------
## 8. NARASI SIMPULAN OTOMATIS (dibangun dari hasil model, bukan template statis)
## ----------------------------------------------------------------------------

tafsir <- function(p) if (p < 0.05) "berpengaruh signifikan" else "tidak berpengaruh signifikan"

jenis_mediasi <- function(p_langsung, p_tidak_langsung) {
  if (p_tidak_langsung < 0.05 && p_langsung < 0.05) return("mediasi parsial (partial mediation)")
  if (p_tidak_langsung < 0.05 && p_langsung >= 0.05) return("mediasi penuh (full mediation)")
  return("tidak terdapat mediasi yang signifikan")
}

poin_simpulan <- c(
  sprintf("%s %s terhadap %s (\u03b2=%.3f; z=%.3f; p=%.3f).",
          label_var["X1"], tafsir(p_X1_Y1$p), label_var["Y1"], p_X1_Y1$beta, p_X1_Y1$z, p_X1_Y1$p),
  sprintf("%s %s terhadap %s (\u03b2=%.3f; z=%.3f; p=%.3f).",
          label_var["X2"], tafsir(p_X2_Y1$p), label_var["Y1"], p_X2_Y1$beta, p_X2_Y1$z, p_X2_Y1$p),
  sprintf("%s %s terhadap %s secara langsung (\u03b2=%.3f; z=%.3f; p=%.3f).",
          label_var["X1"], tafsir(p_X1_Y2$p), label_var["Y2"], p_X1_Y2$beta, p_X1_Y2$z, p_X1_Y2$p),
  sprintf("%s %s terhadap %s secara langsung (\u03b2=%.3f; z=%.3f; p=%.3f).",
          label_var["X2"], tafsir(p_X2_Y2$p), label_var["Y2"], p_X2_Y2$beta, p_X2_Y2$z, p_X2_Y2$p),
  sprintf("%s %s terhadap %s (\u03b2=%.3f; z=%.3f; p=%.3f).",
          label_var["Y1"], tafsir(p_Y1_Y2$p), label_var["Y2"], p_Y1_Y2$beta, p_Y1_Y2$z, p_Y1_Y2$p),
  sprintf("Efek tidak langsung %s->%s->%s: \u03b2=%.3f; z=%.3f; p=%.3f (%s).",
          label_var["X1"], label_var["Y1"], label_var["Y2"], p_IE_X1$beta, p_IE_X1$z, p_IE_X1$p, tafsir(p_IE_X1$p)),
  sprintf("Efek tidak langsung %s->%s->%s: \u03b2=%.3f; z=%.3f; p=%.3f (%s).",
          label_var["X2"], label_var["Y1"], label_var["Y2"], p_IE_X2$beta, p_IE_X2$z, p_IE_X2$p, tafsir(p_IE_X2$p)),
  sprintf("Peran %s sebagai mediator antara %s dan %s: %s.",
          label_var["Y1"], label_var["X1"], label_var["Y2"], jenis_mediasi(p_X1_Y2$p, p_IE_X1$p)),
  sprintf("Peran %s sebagai mediator antara %s dan %s: %s.",
          label_var["Y1"], label_var["X2"], label_var["Y2"], jenis_mediasi(p_X2_Y2$p, p_IE_X2$p)),
  sprintf("Model menjelaskan %.1f%% variasi %s (R\u00b2=%.3f) dan %.1f%% variasi %s (R\u00b2=%.3f).",
          r2_Y1 * 100, label_var["Y1"], r2_Y1, r2_Y2 * 100, label_var["Y2"], r2_Y2)
)

cat("\n\n==================== SIMPULAN HASIL ANALISIS JALUR ====================\n")
cat(paste0(letters[seq_along(poin_simpulan)], ". ", poin_simpulan, collapse = "\n"), "\n")

writeLines(c("SIMPULAN HASIL ANALISIS JALUR", "",
             paste0(letters[seq_along(poin_simpulan)], ". ", poin_simpulan)),
           "07_Ringkasan_Simpulan.txt")


## ----------------------------------------------------------------------------
## 9. MENYUSUN & MENGEKSPOR LAPORAN AKHIR DALAM FORMAT PDF (versi rapi)
## ----------------------------------------------------------------------------
## CATATAN UPGRADE: versi sebelumnya menggambar laporan koordinat demi
## koordinat memakai paket grid -> margin gampang berantakan & font kurang
## menarik karena semua ukuran dihitung manual. Versi ini menyusun laporan
## lewat R Markdown -> PDF (dirender via pandoc + LaTeX/tinytex), yaitu cara
## standar untuk menghasilkan dokumen PDF yang rapi dari R: margin konsisten,
## tipografi baik bawaan LaTeX, tabel & blok kode otomatis melipat baris
## panjang, serta penomoran halaman otomatis di setiap halaman.

## 9a. Pastikan mesin render (pandoc & LaTeX) tersedia -----------------------
if (!rmarkdown::pandoc_available()) {
  stop(paste0(
    "Pandoc tidak ditemukan. Jika dijalankan di RStudio, pandoc biasanya sudah ",
    "tersedia otomatis -- coba buka & jalankan skrip ini lewat RStudio. Jika ",
    "dijalankan lewat Rscript murni, pasang pandoc dari https://pandoc.org/installing.html"
  ))
}

if (!tinytex::is_tinytex()) {
  cat("LaTeX (tinytex) belum terpasang, mencoba instalasi otomatis (sekali saja, +/- 5-10 menit)...\n")
  tryCatch(tinytex::install_tinytex(), error = function(e) {
    stop(paste0(
      "Gagal memasang tinytex otomatis. Jalankan manual di konsol R:\n",
      "  install.packages('tinytex'); tinytex::install_tinytex()\n",
      "lalu jalankan ulang skrip ini."
    ))
  })
}

## 9b. Amankan karakter khusus LaTeX pada teks bebas -------------------------
esc_md <- function(x) gsub("([%_&#{}])", "\\\\\\1", x)

lbl <- function(kode) esc_md(unname(label_var[[kode]]))  # shortcut label aman-LaTeX

## 9c. Susun teks naratif (versi markdown/LaTeX dengan simbol matematis) -----
paragraf_tujuan_md <- sprintf(
  paste0("Penelitian ini bertujuan untuk menganalisis pengaruh **%s (X1)** dan **%s (X2)** ",
         "terhadap **%s (Y2)**, baik secara langsung maupun tidak langsung melalui **%s (Y1)** ",
         "sebagai variabel mediator. Pendekatan yang digunakan adalah analisis jalur ",
         "(*path analysis*) dengan paket `lavaan` pada R, guna mengetahui besaran pengaruh ",
         "langsung, pengaruh tidak langsung, dan pengaruh total antarvariabel berdasarkan data ",
         "hasil survei terhadap %d responden."),
  lbl("X1"), lbl("X2"), lbl("Y2"), lbl("Y1"), nrow(data)
)

paragraf_model_md <- sprintf(
  paste0("Model jalur yang digunakan terdiri atas empat variabel, yaitu dua variabel eksogen ",
         "(**%s** dan **%s**), satu variabel mediator (**%s**), dan satu variabel endogen akhir ",
         "(**%s**). Hubungan kausal antarvariabel dirumuskan dalam dua persamaan struktural berikut:"),
  lbl("X1"), lbl("X2"), lbl("Y1"), lbl("Y2")
)

penutup_model_md <- paste0(
  "Estimasi parameter dilakukan dengan metode *Maximum Likelihood* (ML) melalui fungsi ",
  "`sem()` pada paket **lavaan**. Karena model bersifat *just-identified* (derajat bebas = 0), ",
  "model ini otomatis menghasilkan model *fit* yang sempurna sehingga fokus evaluasi diarahkan ",
  "pada uji signifikansi tiap koefisien jalur."
)

poin_simpulan_md <- c(
  sprintf("%s %s terhadap %s ($\\beta$ = %.3f; $z$ = %.3f; $p$ = %.3f).",
          lbl("X1"), tafsir(p_X1_Y1$p), lbl("Y1"), p_X1_Y1$beta, p_X1_Y1$z, p_X1_Y1$p),
  sprintf("%s %s terhadap %s ($\\beta$ = %.3f; $z$ = %.3f; $p$ = %.3f).",
          lbl("X2"), tafsir(p_X2_Y1$p), lbl("Y1"), p_X2_Y1$beta, p_X2_Y1$z, p_X2_Y1$p),
  sprintf("%s %s terhadap %s secara langsung ($\\beta$ = %.3f; $z$ = %.3f; $p$ = %.3f).",
          lbl("X1"), tafsir(p_X1_Y2$p), lbl("Y2"), p_X1_Y2$beta, p_X1_Y2$z, p_X1_Y2$p),
  sprintf("%s %s terhadap %s secara langsung ($\\beta$ = %.3f; $z$ = %.3f; $p$ = %.3f).",
          lbl("X2"), tafsir(p_X2_Y2$p), lbl("Y2"), p_X2_Y2$beta, p_X2_Y2$z, p_X2_Y2$p),
  sprintf("%s %s terhadap %s ($\\beta$ = %.3f; $z$ = %.3f; $p$ = %.3f).",
          lbl("Y1"), tafsir(p_Y1_Y2$p), lbl("Y2"), p_Y1_Y2$beta, p_Y1_Y2$z, p_Y1_Y2$p),
  sprintf("Efek tidak langsung %s $\\rightarrow$ %s $\\rightarrow$ %s: $\\beta$ = %.3f; $z$ = %.3f; $p$ = %.3f (%s).",
          lbl("X1"), lbl("Y1"), lbl("Y2"), p_IE_X1$beta, p_IE_X1$z, p_IE_X1$p, tafsir(p_IE_X1$p)),
  sprintf("Efek tidak langsung %s $\\rightarrow$ %s $\\rightarrow$ %s: $\\beta$ = %.3f; $z$ = %.3f; $p$ = %.3f (%s).",
          lbl("X2"), lbl("Y1"), lbl("Y2"), p_IE_X2$beta, p_IE_X2$z, p_IE_X2$p, tafsir(p_IE_X2$p)),
  sprintf("Peran %s sebagai mediator antara %s dan %s: %s.",
          lbl("Y1"), lbl("X1"), lbl("Y2"), jenis_mediasi(p_X1_Y2$p, p_IE_X1$p)),
  sprintf("Peran %s sebagai mediator antara %s dan %s: %s.",
          lbl("Y1"), lbl("X2"), lbl("Y2"), jenis_mediasi(p_X2_Y2$p, p_IE_X2$p)),
  sprintf("Model menjelaskan %.1f\\%% variasi %s ($R^2$ = %.3f) dan %.1f\\%% variasi %s ($R^2$ = %.3f).",
          r2_Y1 * 100, lbl("Y1"), r2_Y1, r2_Y2 * 100, lbl("Y2"), r2_Y2)
)

## 9d. Tabel koefisien jalur, disusun langsung sebagai tabel Markdown --------
baris_tabel_md <- c(
  "| Hubungan | Beta Standar | z-hitung | p-value | Sig. |",
  "|:---|---:|---:|---:|:---:|",
  sprintf("| %s | %.3f | %.3f | %.3f | %s |",
          gsub("_", "\\\\_", tabel_jalur$Hubungan), tabel_jalur$Std_Beta,
          tabel_jalur$z_hitung, tabel_jalur$p_value, tabel_jalur$Sig)
)

## 9e. Siapkan lampiran teks: skrip R & output lavaan ------------------------
path_skrip_sendiri <- tryCatch({
  if (requireNamespace("rstudioapi", quietly = TRUE) && rstudioapi::isAvailable()) {
    p <- rstudioapi::getSourceEditorContext()$path
    if (is.null(p) || p == "") stop("kosong")
    p
  } else {
    arg <- commandArgs(trailingOnly = FALSE)
    f   <- sub("^--file=", "", arg[grep("^--file=", arg)])
    if (length(f) == 0) stop("tidak ditemukan")
    normalizePath(f)
  }
}, error = function(e) file.path(folder_kerja, nama_skrip))

if (file.exists(path_skrip_sendiri)) {
  baris_skrip <- readLines(path_skrip_sendiri, warn = FALSE)
} else {
  baris_skrip <- c("[Skrip tidak ditemukan otomatis -- pastikan file skrip berada di folder kerja",
                    paste0("dengan nama '", nama_skrip, "', atau jalankan lewat RStudio.]"))
}

baris_output_lavaan <- capture.output(
  summary(fit, standardized = TRUE, fit.measures = TRUE, rsquare = TRUE)
)

## 9f. Susun halaman sampul (raw LaTeX, agar tipografi rapi & simetris) ------
baris_sampul <- c(
  r"(\begin{titlepage})",
  r"(\centering)",
  r"(\vspace*{2.5cm})",
  sprintf(r"({\LARGE \textbf{%s}}\\[1cm])", judul_penelitian),
  r"({\large Laporan Singkat Analisis Jalur (\textit{Path Analysis})}\\[2cm])",
  r"(\renewcommand{\arraystretch}{1.6})",
  r"(\begin{tabular}{cl})",
  sprintf(r"(X1 & = %s \textit{(variabel eksogen)} \\)", lbl("X1")),
  sprintf(r"(X2 & = %s \textit{(variabel eksogen)} \\)", lbl("X2")),
  sprintf(r"(Y1 & = %s \textit{(variabel mediator)} \\)", lbl("Y1")),
  sprintf(r"(Y2 & = %s \textit{(variabel endogen)} \\)", lbl("Y2")),
  r"(\end{tabular})",
  r"(\vspace{1.5cm})",
  sprintf(r"(Jumlah Responden (n) = %d \\)", nrow(data)),
  sprintf(r"(Tanggal Analisis: %s)", format(Sys.Date(), "%d %B %Y")),
  r"(\vfill)",
  r"(\end{titlepage})",
  ""
)

## 9g. Bangun isi file R Markdown (.Rmd) secara terprogram -------------------
rmd <- c(
  "---",
  "output:",
  "  pdf_document:",
  "    toc: false",
  "    number_sections: false",
  "    latex_engine: pdflatex",
  "geometry: margin=2.5cm",
  "fontsize: 11pt",
  "header-includes:",
  r"(  - \usepackage{fvextra})",
  r"(  - \usepackage{booktabs})",
  r"(  - \usepackage{longtable})",
  r"(  - \usepackage{array})",
  r"(  - \DefineVerbatimEnvironment{Highlighting}{Verbatim}{breaklines,breakanywhere,fontsize=\small})",
  r"(  - \DefineVerbatimEnvironment{verbatim}{Verbatim}{breaklines,breakanywhere,fontsize=\small})",
  "---",
  "",
  baris_sampul,
  r"(\newpage)",
  "",
  "# 1. Tujuan Penelitian",
  "",
  paragraf_tujuan_md,
  "",
  "# 2. Model Jalur yang Digunakan",
  "",
  paragraf_model_md,
  "",
  "$$Y_1 = a_1 X_1 + a_2 X_2 + \\varepsilon_1$$",
  "$$Y_2 = b_1 X_1 + b_2 X_2 + c\\,Y_1 + \\varepsilon_2$$",
  "",
  "Efek tidak langsung: $IE_{X1} = a_1 \\times c$ dan $IE_{X2} = a_2 \\times c$.  ",
  "Efek total: $Total_{X1} = b_1 + IE_{X1}$ dan $Total_{X2} = b_2 + IE_{X2}$.",
  "",
  penutup_model_md,
  "",
  "![Diagram Jalur Hasil Estimasi. Angka pada garis adalah koefisien jalur terstandarisasi (biru = positif, merah = negatif; ketebalan garis sebanding dengan besar koefisien); nilai R^2 pada kotak menunjukkan proporsi variasi yang terjelaskan oleh model. \\*\\*\\* p<0.001, \\*\\* p<0.01, \\* p<0.05, ns = tidak signifikan.](05_Diagram_Jalur.png){width=95%}",
  "",
  r"(\newpage)",
  "",
  "# 3. Simpulan Hasil Analisis Jalur",
  "",
  paste0(seq_along(poin_simpulan_md), ". ", poin_simpulan_md),
  "",
  r"(\newpage)",
  "",
  "## Visual Pendukung",
  "",
  "![Matriks Korelasi Antarvariabel Penelitian](02_Heatmap_Korelasi.png){width=80%}",
  "",
  r"(\newpage)",
  "",
  "![Sebaran & Hubungan Antarvariabel](03_Scatterplot_Matrix.png){width=100%}",
  "",
  r"(\newpage)",
  "",
  "![Dekomposisi Pengaruh terhadap Loyalitas Konsumen -- Langsung, Tidak Langsung, Total](06_Dekomposisi_Efek.png){width=80%}",
  "",
  r"(\newpage)",
  "",
  "# 4. Lampiran",
  "",
  "## Lampiran A. Skrip R Lengkap",
  "",
  "```r",
  baris_skrip,
  "```",
  "",
  r"(\newpage)",
  "",
  "## Lampiran B. Output Analisis Jalur (lavaan)",
  "",
  "```",
  baris_output_lavaan,
  "```",
  "",
  r"(\newpage)",
  "",
  "## Lampiran C. Tabel Ringkas Koefisien Jalur",
  "",
  baris_tabel_md
)

path_rmd <- file.path(folder_kerja, "Laporan_Analisis_Jalur.Rmd")
writeLines(rmd, path_rmd, useBytes = TRUE)

cat("\nMerender laporan PDF (proses LaTeX via pandoc, mohon tunggu)...\n")

rmarkdown::render(
  input       = path_rmd,
  output_file = "Laporan_Analisis_Jalur.pdf",
  output_dir  = folder_kerja,
  quiet       = TRUE
)

cat("\n>> LAPORAN PDF berhasil dibuat: ", file.path(folder_kerja, "Laporan_Analisis_Jalur.pdf"), "\n")
cat(">> Seluruh file pendukung (CSV & PNG) tersimpan di folder kerja:\n   ", folder_kerja, "\n")
