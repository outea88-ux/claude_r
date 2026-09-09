## ============================================================================
## UJIAN TENGAH SEMESTER - TEORI RESPONS BUTIR (IRT)
## Data Dikotomi dan Politomi
## ----------------------------------------------------------------------------
## Nama     : Herman
## NIM      : 25071250028
## Prodi    : Pascasarjana - Pengukuran dan Evaluasi Pendidikan (PEP)
## Kampus   : Universitas Negeri Yogyakarta
##
## Cakupan skrip (mengikuti urutan soal UTS):
##   Soal 1 : Simulasi data dikotomi, model Rasch (1-PL)   - 20 butir, 500 responden
##            a. Parameter kesulitan butir (b)
##            b. ICC tiga butir pertama
##   Soal 2 : Simulasi data politomi, Graded Response Model (GRM) - 10 butir,
##            300 responden, skala Likert 5 kategori
##            a. Parameter daya beda (a) & kesulitan (b1-b4)
##            b. ICC (kurva kategori) dua butir pertama
##   Soal 3 : Simulasi data politomi, Partial Credit Model (PCM) - 15 butir,
##            400 responden, 4 kategori skor (0,1,2,3)
##            a. Parameter threshold kategori tiap butir
##            b. ICC butir kelima
##   Soal 4 : Reliabilitas & fungsi informasi tes (berdasarkan Soal 1 & Soal 2)
##            a. Plot informasi tes vs kemampuan (theta)
##            b. Perbandingan informasi tes dikotomi vs politomi
##
## OUTPUT AKHIR: skrip ini menghasilkan satu file
##   "Laporan_UTS_TeoriResponsButir.pdf"
## di folder kerja, berisi seluruh jawaban (narasi + tabel + grafik) plus
## lampiran skrip R lengkap. Laporan disusun lewat R Markdown -> pandoc ->
## LaTeX (paket rmarkdown + tinytex) supaya margin & tipografi rapi secara
## otomatis, sama seperti skrip Tugas 1 (Path Analysis).
##
## Struktur skrip:
##   0.  Konfigurasi & identitas
##   0b. Sistem desain visual (palet warna & tema ggplot2 bersama)
##   1.  Persiapan paket
##   2.  SOAL 1  - Simulasi & analisis data dikotomi (Rasch)
##   3.  SOAL 2  - Simulasi & analisis data politomi (GRM)
##   4.  SOAL 3  - Simulasi & analisis data politomi (PCM)
##   5.  SOAL 4  - Reliabilitas & informasi tes (dikotomi vs politomi)
##   6.  Menyusun & mengekspor LAPORAN AKHIR dalam format PDF
## ============================================================================


## ----------------------------------------------------------------------------
## 0. KONFIGURASI & IDENTITAS
## ----------------------------------------------------------------------------

# --- Folder kerja (SESUAIKAN JIKA LOKASI BERBEDA) ---------------------------
folder_kerja <- "D:/0. S3 PROJECT/TEORI RESPONS BUTIR/UTS"
nama_skrip   <- "UTS_TeoriResponsButir_IRT.R"   # nama file skrip ini (dilampirkan di PDF)

if (!dir.exists(folder_kerja)) dir.create(folder_kerja, recursive = TRUE, showWarnings = FALSE)
setwd(folder_kerja)

# --- Identitas mahasiswa (dipakai di sampul & header laporan) --------------
nama_mhs   <- "Herman"
nim_mhs    <- "25071250028"
prodi_mhs  <- "Pascasarjana Prodi Pengukuran dan Evaluasi Pendidikan (PEP)"
univ_mhs   <- "Universitas Negeri Yogyakarta"
matkul     <- "Teori Respons Butir (IRT) - Data Dikotomi dan Politomi"
jenis_ujian <- "Ujian Tengah Semester (UTS)"

# --- Reproduksibilitas: seed diturunkan dari NIM agar hasil konsisten setiap
#     kali skrip dijalankan ulang, sekaligus "personal" terhadap identitas ---
seed_utama <- as.integer(substr(nim_mhs, 4, 11))   # 8 digit terakhir NIM
set.seed(seed_utama)


## ----------------------------------------------------------------------------
## 0b. SISTEM DESAIN VISUAL (dipakai bersama oleh seluruh grafik di skrip ini)
## ----------------------------------------------------------------------------
## Satu palet & satu tema dipakai konsisten di semua grafik supaya laporan
## terasa sebagai satu sistem visual (bukan tempelan gaya berbeda-beda), dan
## sudah dipilih agar tetap terbedakan bagi pembaca buta warna (CVD-safe).

# --- Palet kategorikal (dipakai untuk butir/kategori berbeda, urutan tetap) --
palet_kategorikal <- c(
  "#2A78D6",  # biru
  "#EB6834",  # oranye
  "#1BAF7A",  # aqua/hijau
  "#8B5FBF",  # ungu
  "#E34948",  # merah
  "#C7A62C"   # kuning tua (cadangan kategori ke-6)
)

# --- Warna tinta & latar (tipografi & chrome grafik) -------------------------
warna_ink          <- "#0B0B0B"   # teks utama (judul)
warna_ink_sekunder <- "#52514E"   # teks sekunder (subjudul, badan)
warna_ink_muted    <- "#898781"   # teks pendukung (sumbu, catatan kaki)
warna_grid         <- "#E1E0D9"   # garis bantu (gridline tipis)
warna_surface      <- "#FCFCFB"   # latar panel/plot
warna_aksen        <- "#2A78D6"   # aksen tunggal (mis. garis vertikal referensi)

font_dasar  <- "sans"   # font sistem; ganti mis. "Helvetica" bila tersedia
dpi_ekspor  <- 320       # resolusi ekspor PNG (lebih tajam saat dicetak)

# ggplot2 TIDAK melipat teks caption/subtitle panjang secara otomatis -- tanpa
# ini, catatan kaki yang panjang akan terpotong di tepi gambar. Dipakai di
# setiap labs(caption = bungkus(...)) pada seluruh grafik skrip ini.
bungkus <- function(x, lebar = 95) paste(strwrap(x, width = lebar), collapse = "\n")

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
      strip.text       = element_text(color = warna_ink, size = base_size - 1, face = "bold"),
      strip.background = element_rect(fill = warna_grid, color = NA),
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

## Soal mengizinkan paket "ltm" atau "mirt". Skrip ini memakai "mirt" secara
## konsisten untuk seluruh model (Rasch, GRM, PCM) karena satu paket ini sudah
## mencakup keempatnya dengan antarmuka yang seragam (simdata(), mirt(), coef(),
## testinfo()), sehingga tidak perlu mencampur dua paket berbeda.
paket_dibutuhkan <- c(
  "mirt",                         # simulasi & estimasi model IRT dikotomi/politomi
  "dplyr", "tidyr", "purrr",      # manajemen data
  "ggplot2",                      # visualisasi
  "rmarkdown", "knitr", "tinytex" # penyusunan laporan akhir (PDF rapi via LaTeX)
)

paket_belum_ada <- paket_dibutuhkan[!paket_dibutuhkan %in% installed.packages()[, "Package"]]
if (length(paket_belum_ada) > 0) install.packages(paket_belum_ada, dependencies = TRUE)

invisible(lapply(paket_dibutuhkan, library, character.only = TRUE))

cat("Seed simulasi (diturunkan dari NIM):", seed_utama, "\n")


## ==============================================================================
## 2. SOAL 1 - SIMULASI DATA DIKOTOMI (MODEL RASCH / 1-PARAMETER LOGISTIC)
## ==============================================================================
## Rasch model: P(X=1|theta,b) = 1 / (1 + exp(-(theta - b)))  [daya beda a = 1
## untuk semua butir -- itulah ciri model 1-parameter].

n_butir_1     <- 20
n_responden_1 <- 500

## 2.1 Pembangkitan parameter & data ------------------------------------------
b_true_1 <- round(rnorm(n_butir_1, mean = 0, sd = 1), 2)        # kesulitan butir "benar"
a_true_1 <- rep(1, n_butir_1)                                    # daya beda seragam (ciri Rasch)
theta_1  <- rnorm(n_responden_1, mean = 0, sd = 1)                # kemampuan peserta

# Parameterisasi mirt: P = 1/(1+exp(-(a*theta + d))), dengan d = -a*b
d_true_1 <- -a_true_1 * b_true_1

data_dikotomi <- simdata(
  a = matrix(a_true_1, ncol = 1),
  d = d_true_1,
  N = n_responden_1,
  itemtype = "dich",
  Theta = matrix(theta_1, ncol = 1)
)
colnames(data_dikotomi) <- paste0("Butir", sprintf("%02d", 1:n_butir_1))

cat("\n== SOAL 1: Data dikotomi tersimulasi ==\n")
cat("Dimensi data  :", nrow(data_dikotomi), "responden x", ncol(data_dikotomi), "butir\n")
write.csv(data_dikotomi, "S1_Data_Simulasi_Dikotomi.csv", row.names = FALSE)

## 2.2 Estimasi model Rasch dengan mirt ---------------------------------------
fit_rasch <- mirt(data_dikotomi, model = 1, itemtype = "Rasch", verbose = FALSE)

cat("\n============== HASIL ESTIMASI MODEL RASCH (SOAL 1) ==============\n")
print(fit_rasch)

## 2.2a Parameter kesulitan butir (b) hasil estimasi --------------------------
par_rasch <- coef(fit_rasch, IRTpars = TRUE, simplify = TRUE)$items
tabel_b_1 <- data.frame(
  Butir       = colnames(data_dikotomi),
  b_true      = b_true_1,
  a_estimasi  = round(par_rasch[, "a"], 3),
  b_estimasi  = round(par_rasch[, "b"], 3)
)
rownames(tabel_b_1) <- NULL   # cegah nama parameter mirt terbawa jadi rowname ganda
cat("\nTabel parameter kesulitan butir (b) - Soal 1:\n")
print(tabel_b_1, row.names = FALSE)
write.csv(tabel_b_1, "S1_Tabel_Parameter_b.csv", row.names = FALSE)

## 2.2b ICC untuk tiga butir pertama ------------------------------------------
grid_theta <- seq(-4, 4, by = 0.05)

fungsi_icc_dikotomi <- function(theta, a, b) 1 / (1 + exp(-a * (theta - b)))

icc_data_1 <- purrr::map_dfr(1:3, function(i) {
  data.frame(
    Theta = grid_theta,
    P     = fungsi_icc_dikotomi(grid_theta, par_rasch[i, "a"], par_rasch[i, "b"]),
    Butir = sprintf("%s (b = %.2f)", tabel_b_1$Butir[i], tabel_b_1$b_estimasi[i])
  )
})

plot_icc_1 <- ggplot(icc_data_1, aes(x = Theta, y = P, color = Butir)) +
  geom_hline(yintercept = 0.5, color = warna_grid, linewidth = 0.4, linetype = "dashed") +
  geom_line(linewidth = 1.1) +
  scale_color_manual(values = palet_kategorikal[1:3]) +
  scale_y_continuous(limits = c(0, 1), breaks = seq(0, 1, 0.25)) +
  labs(
    title    = "Item Characteristic Curve (ICC) - Tiga Butir Pertama",
    subtitle = "Model Rasch (1-PL) - data dikotomi, Soal 1",
    x = "Kemampuan Peserta (\u03b8)",
    y = "Probabilitas Menjawab Benar",
    color = "Butir",
    caption = bungkus("Garis putus-putus menandai P = 0,50; titik potong kurva dengan garis ini terletak pada theta = b (parameter kesulitan butir).")
  ) +
  tema_laporan(base_size = 13)

ggsave("S1_ICC_TigaButirPertama.png", plot_icc_1, width = 7.5, height = 5.5, dpi = dpi_ekspor)
print(plot_icc_1)


## ==============================================================================
## 3. SOAL 2 - SIMULASI DATA POLITOMI (GRADED RESPONSE MODEL / GRM)
## ==============================================================================
## Skala Likert 5 kategori: 0 = Sangat Tidak Setuju, ..., 4 = Sangat Setuju.
## GRM memodelkan 4 fungsi kategori kumulatif (boundary) per butir.

n_butir_2     <- 10
n_responden_2 <- 300
n_kategori_2  <- 5
label_likert  <- c("Sangat Tidak Setuju", "Tidak Setuju", "Netral", "Setuju", "Sangat Setuju")

## 3.1 Pembangkitan parameter & data ------------------------------------------
a_true_2 <- round(runif(n_butir_2, min = 0.8, max = 2.2), 2)      # daya beda

# Empat threshold (b1<b2<b3<b4) per butir untuk 5 kategori
b_true_2 <- t(sapply(1:n_butir_2, function(i) sort(round(rnorm(n_kategori_2 - 1, 0, 1), 2))))
colnames(b_true_2) <- paste0("b", 1:(n_kategori_2 - 1))

# Parameterisasi mirt (graded): d_k = -a*b_k -> otomatis urut menurun karena b naik
d_true_2 <- -a_true_2 * b_true_2

theta_2 <- rnorm(n_responden_2, mean = 0, sd = 1)

data_politomi_grm <- simdata(
  a = matrix(a_true_2, ncol = 1),
  d = d_true_2,
  N = n_responden_2,
  itemtype = "graded",
  Theta = matrix(theta_2, ncol = 1)
)
colnames(data_politomi_grm) <- paste0("Butir", sprintf("%02d", 1:n_butir_2))

cat("\n== SOAL 2: Data politomi (GRM) tersimulasi ==\n")
cat("Dimensi data  :", nrow(data_politomi_grm), "responden x", ncol(data_politomi_grm), "butir\n")
write.csv(data_politomi_grm, "S2_Data_Simulasi_GRM.csv", row.names = FALSE)

## 3.2 Estimasi model GRM dengan mirt -----------------------------------------
fit_grm <- mirt(data_politomi_grm, model = 1, itemtype = "graded", verbose = FALSE)

cat("\n============== HASIL ESTIMASI MODEL GRM (SOAL 2) ==============\n")
print(fit_grm)

## 3.2a Parameter daya beda (a) & kesulitan/threshold (b1-b4) -----------------
par_grm <- coef(fit_grm, IRTpars = TRUE, simplify = TRUE)$items
tabel_grm <- data.frame(
  Butir = colnames(data_politomi_grm),
  a     = round(par_grm[, "a"], 3),
  round(par_grm[, paste0("b", 1:(n_kategori_2 - 1))], 3)
)
rownames(tabel_grm) <- NULL   # cegah nama parameter mirt terbawa jadi rowname ganda
cat("\nTabel parameter daya beda (a) & threshold (b1-b4) - Soal 2:\n")
print(tabel_grm, row.names = FALSE)
write.csv(tabel_grm, "S2_Tabel_Parameter_GRM.csv", row.names = FALSE)

## 3.2b ICC (kurva probabilitas kategori) untuk dua butir pertama ------------
fungsi_kategori_grm <- function(theta, a, b_vec) {
  ncat  <- length(b_vec) + 1
  p_bawah <- c(1, 1 / (1 + exp(-a * (theta - b_vec))), 0)   # P*(X >= k), k = 0..ncat
  sapply(1:ncat, function(k) p_bawah[k] - p_bawah[k + 1])
}

buat_data_icc_grm <- function(item_idx) {
  a_i <- par_grm[item_idx, "a"]
  b_i <- par_grm[item_idx, paste0("b", 1:(n_kategori_2 - 1))]
  mat_p <- t(sapply(grid_theta, fungsi_kategori_grm, a = a_i, b_vec = b_i))
  colnames(mat_p) <- label_likert
  df <- as.data.frame(mat_p)
  df$Theta <- grid_theta
  df$Butir <- tabel_grm$Butir[item_idx]
  tidyr::pivot_longer(df, cols = all_of(label_likert), names_to = "Kategori", values_to = "P")
}

icc_data_2 <- dplyr::bind_rows(lapply(1:2, buat_data_icc_grm))
icc_data_2$Kategori <- factor(icc_data_2$Kategori, levels = label_likert)

plot_icc_2 <- ggplot(icc_data_2, aes(x = Theta, y = P, color = Kategori)) +
  geom_line(linewidth = 1.05) +
  facet_wrap(~Butir, ncol = 2) +
  scale_color_manual(values = palet_kategorikal[1:5]) +
  scale_y_continuous(limits = c(0, 1), breaks = seq(0, 1, 0.25)) +
  labs(
    title    = "Item Characteristic Curve (ICC) - Dua Butir Pertama",
    subtitle = "Graded Response Model (GRM) - skala Likert 5 kategori, Soal 2",
    x = "Kemampuan Peserta (\u03b8)",
    y = "Probabilitas Memilih Kategori",
    color = "Kategori Respons",
    caption = bungkus("Setiap kurva adalah probabilitas memilih satu kategori Likert tertentu pada tiap tingkat theta; puncak kurva bergeser ke kanan seiring naiknya urutan kategori.")
  ) +
  tema_laporan(base_size = 12) +
  theme(legend.position = "bottom")

ggsave("S2_ICC_DuaButirPertama.png", plot_icc_2, width = 9, height = 5.5, dpi = dpi_ekspor)
print(plot_icc_2)


## ==============================================================================
## 4. SOAL 3 - SIMULASI DATA POLITOMI (PARTIAL CREDIT MODEL / PCM)
## ==============================================================================
## Setiap butir memiliki 4 kategori skor (0,1,2,3) -> 3 threshold per butir.
## PCM adalah kasus khusus GPCM dengan daya beda seragam (a = 1) -- di mirt,
## itemtype "Rasch" untuk data politomi menghasilkan Partial Credit Model.

n_butir_3     <- 15
n_responden_3 <- 400
n_kategori_3  <- 4

## 4.1 Pembangkitan parameter & data ------------------------------------------
a_true_3 <- rep(1, n_butir_3)   # PCM: daya beda seragam

# Threshold (step difficulty) tidak wajib terurut pada PCM (khas dibanding GRM)
b_true_3 <- matrix(
  round(rnorm(n_butir_3 * (n_kategori_3 - 1), mean = 0, sd = 1), 2),
  nrow = n_butir_3, ncol = n_kategori_3 - 1
)
colnames(b_true_3) <- paste0("b", 1:(n_kategori_3 - 1))

d_true_3 <- -a_true_3 * b_true_3   # a = 1 -> d = -b
theta_3  <- rnorm(n_responden_3, mean = 0, sd = 1)

data_politomi_pcm <- simdata(
  a = matrix(a_true_3, ncol = 1),
  d = d_true_3,
  N = n_responden_3,
  itemtype = "gpcm",
  Theta = matrix(theta_3, ncol = 1)
)
colnames(data_politomi_pcm) <- paste0("Butir", sprintf("%02d", 1:n_butir_3))

cat("\n== SOAL 3: Data politomi (PCM) tersimulasi ==\n")
cat("Dimensi data  :", nrow(data_politomi_pcm), "responden x", ncol(data_politomi_pcm), "butir\n")
write.csv(data_politomi_pcm, "S3_Data_Simulasi_PCM.csv", row.names = FALSE)

## 4.2 Estimasi model PCM dengan mirt (itemtype = "Rasch" untuk data politomi) -
fit_pcm <- mirt(data_politomi_pcm, model = 1, itemtype = "Rasch", verbose = FALSE)

cat("\n============== HASIL ESTIMASI MODEL PCM (SOAL 3) ==============\n")
print(fit_pcm)

## 4.2a Parameter threshold (kesulitan kategori) tiap butir -------------------
par_pcm <- coef(fit_pcm, IRTpars = TRUE, simplify = TRUE)$items
kolom_b_pcm <- grep("^b[0-9]+$", colnames(par_pcm), value = TRUE)

tabel_pcm <- data.frame(
  Butir = colnames(data_politomi_pcm),
  round(par_pcm[, kolom_b_pcm], 3)
)
rownames(tabel_pcm) <- NULL   # cegah nama parameter mirt terbawa jadi rowname ganda
cat("\nTabel parameter threshold kategori - Soal 3:\n")
print(tabel_pcm, row.names = FALSE)
write.csv(tabel_pcm, "S3_Tabel_Parameter_PCM.csv", row.names = FALSE)

## 4.2b ICC (kurva probabilitas kategori) untuk butir kelima ------------------
item_target_3 <- 5

fungsi_kategori_pcm <- function(theta, a, b_vec) {
  ncat   <- length(b_vec) + 1
  d_vec  <- c(0, -a * b_vec)                     # d0 = 0, d_k = -a*b_k
  kumulatif <- cumsum(d_vec + a * theta)          # sum_{v=0}^{k} (a*theta + d_v)
  probs  <- exp(kumulatif) / sum(exp(kumulatif))
  probs
}

a_5 <- par_pcm[item_target_3, "a"]
b_5 <- as.numeric(par_pcm[item_target_3, kolom_b_pcm])

mat_p_5 <- t(sapply(grid_theta, fungsi_kategori_pcm, a = a_5, b_vec = b_5))
colnames(mat_p_5) <- paste("Skor", 0:(n_kategori_3 - 1))
icc_data_3 <- as.data.frame(mat_p_5)
icc_data_3$Theta <- grid_theta
icc_data_3 <- tidyr::pivot_longer(icc_data_3, cols = -Theta, names_to = "Kategori", values_to = "P")
icc_data_3$Kategori <- factor(icc_data_3$Kategori, levels = paste("Skor", 0:(n_kategori_3 - 1)))

plot_icc_3 <- ggplot(icc_data_3, aes(x = Theta, y = P, color = Kategori)) +
  geom_line(linewidth = 1.1) +
  scale_color_manual(values = palet_kategorikal[1:n_kategori_3]) +
  scale_y_continuous(limits = c(0, 1), breaks = seq(0, 1, 0.25)) +
  labs(
    title    = sprintf("Item Characteristic Curve (ICC) - %s", tabel_pcm$Butir[item_target_3]),
    subtitle = "Partial Credit Model (PCM) - 4 kategori skor (0-3), Soal 3",
    x = "Kemampuan Peserta (\u03b8)",
    y = "Probabilitas Memperoleh Skor",
    color = "Kategori Skor",
    caption = bungkus("Tiap kurva adalah probabilitas memperoleh skor kategori tertentu pada butir ke-5; puncak kurva bergeser ke kanan seiring naiknya kategori skor, menandakan skor lebih tinggi membutuhkan kemampuan lebih besar.")
  ) +
  tema_laporan(base_size = 13)

ggsave("S3_ICC_Butir5.png", plot_icc_3, width = 7.5, height = 5.5, dpi = dpi_ekspor)
print(plot_icc_3)


## ==============================================================================
## 5. SOAL 4 - RELIABILITAS & INFORMASI TES (DIKOTOMI vs POLITOMI)
## ==============================================================================
## Menggunakan model unidimensional hasil Soal 1 (Rasch, fit_rasch) dan
## Soal 2 (GRM, fit_grm).

grid_theta_info <- matrix(seq(-4, 4, by = 0.05), ncol = 1)

## 5.1 Fungsi informasi tes ----------------------------------------------------
info_dikotomi <- testinfo(fit_rasch, grid_theta_info)
info_politomi <- testinfo(fit_grm, grid_theta_info)
se_dikotomi   <- 1 / sqrt(info_dikotomi)
se_politomi   <- 1 / sqrt(info_politomi)

## 5.2 Reliabilitas marginal ----------------------------------------------------
rel_dikotomi <- marginal_rxx(fit_rasch)
rel_politomi <- marginal_rxx(fit_grm)

cat("\n============== SOAL 4: RELIABILITAS & INFORMASI TES ==============\n")
cat(sprintf("Reliabilitas marginal - Soal 1 (dikotomi, Rasch) : %.3f\n", rel_dikotomi))
cat(sprintf("Reliabilitas marginal - Soal 2 (politomi, GRM)   : %.3f\n", rel_politomi))

tabel_reliabilitas <- data.frame(
  Model            = c("Soal 1 - Dikotomi (Rasch)", "Soal 2 - Politomi (GRM)"),
  Jumlah_Butir     = c(n_butir_1, n_butir_2),
  Jumlah_Responden = c(n_responden_1, n_responden_2),
  Reliabilitas_Marginal = round(c(rel_dikotomi, rel_politomi), 3)
)
write.csv(tabel_reliabilitas, "S4_Tabel_Reliabilitas.csv", row.names = FALSE)

## 5.3 Titik theta dengan informasi maksimum -----------------------------------
theta_maks_dikotomi <- grid_theta_info[which.max(info_dikotomi), 1]
theta_maks_politomi <- grid_theta_info[which.max(info_politomi), 1]
info_maks_dikotomi  <- max(info_dikotomi)
info_maks_politomi  <- max(info_politomi)

## 5.4a Plot informasi tes utk masing-masing model (dgn kurva SE) -------------
buat_plot_info <- function(theta_vec, info_vec, se_vec, judul, subjudul, warna) {
  df <- data.frame(Theta = theta_vec, Informasi = info_vec, SE = se_vec)
  skala_sekunder <- max(info_vec) / max(se_vec, na.rm = TRUE)

  ggplot(df, aes(x = Theta)) +
    geom_line(aes(y = Informasi), color = warna, linewidth = 1.2) +
    geom_line(aes(y = SE * skala_sekunder), color = warna_ink_muted,
              linewidth = 0.9, linetype = "dashed") +
    scale_y_continuous(
      name = "Informasi Tes I(\u03b8)",
      sec.axis = sec_axis(~ . / skala_sekunder, name = "Galat Baku Pengukuran SE(\u03b8)")
    ) +
    labs(title = judul, subtitle = subjudul,
         x = "Kemampuan Peserta (\u03b8)",
         caption = bungkus("Garis penuh = fungsi informasi tes I(\u03b8) (sumbu kiri); garis putus-putus = galat baku pengukuran SE(\u03b8) (sumbu kanan). Semakin tinggi I(\u03b8), semakin kecil SE(\u03b8).")) +
    tema_laporan(base_size = 13)
}

plot_info_1 <- buat_plot_info(
  grid_theta_info[, 1], info_dikotomi, se_dikotomi,
  "Fungsi Informasi Tes - Soal 1 (Dikotomi, Rasch)",
  sprintf("Informasi maksimum = %.2f pada \u03b8 = %.2f", info_maks_dikotomi, theta_maks_dikotomi),
  palet_kategorikal[1]
)
ggsave("S4_Info_Dikotomi.png", plot_info_1, width = 7.5, height = 5, dpi = dpi_ekspor)
print(plot_info_1)

plot_info_2 <- buat_plot_info(
  grid_theta_info[, 1], info_politomi, se_politomi,
  "Fungsi Informasi Tes - Soal 2 (Politomi, GRM)",
  sprintf("Informasi maksimum = %.2f pada \u03b8 = %.2f", info_maks_politomi, theta_maks_politomi),
  palet_kategorikal[2]
)
ggsave("S4_Info_Politomi.png", plot_info_2, width = 7.5, height = 5, dpi = dpi_ekspor)
print(plot_info_2)

## 5.4b Plot perbandingan gabungan (dikotomi vs politomi) ---------------------
df_perbandingan <- rbind(
  data.frame(Theta = grid_theta_info[, 1], Informasi = info_dikotomi,
             Model = sprintf("Soal 1 - Dikotomi (%d butir)", n_butir_1)),
  data.frame(Theta = grid_theta_info[, 1], Informasi = info_politomi,
             Model = sprintf("Soal 2 - Politomi (%d butir)", n_butir_2))
)

plot_perbandingan_info <- ggplot(df_perbandingan, aes(x = Theta, y = Informasi, color = Model)) +
  geom_line(linewidth = 1.2) +
  scale_color_manual(values = palet_kategorikal[1:2]) +
  labs(
    title    = "Perbandingan Informasi Tes: Model Dikotomi vs Politomi",
    subtitle = "Soal 1 (Rasch, 20 butir dikotomi) vs Soal 2 (GRM, 10 butir politomi 5 kategori)",
    x = "Kemampuan Peserta (\u03b8)",
    y = "Informasi Tes I(\u03b8)", color = NULL,
    caption = bungkus("Butir politomi (banyak kategori respons) umumnya menyumbang informasi lebih besar per butir dibanding butir dikotomi pada rentang theta yang sama.")
  ) +
  tema_laporan(base_size = 13)

ggsave("S4_Perbandingan_Informasi.png", plot_perbandingan_info, width = 8, height = 5.5, dpi = dpi_ekspor)
print(plot_perbandingan_info)

cat("\nSemua analisis Soal 1-4 selesai. Lanjut menyusun laporan PDF...\n")


## ==============================================================================
## 6. MENYUSUN & MENGEKSPOR LAPORAN AKHIR DALAM FORMAT PDF
## ==============================================================================
## Laporan disusun lewat R Markdown -> pandoc -> LaTeX (paket rmarkdown +
## tinytex), sama seperti skrip Tugas 1 (Path Analysis): margin & tipografi
## konsisten karena memakai mesin tata-letak dokumen (LaTeX) yang sudah teruji.

## 6a. Pastikan mesin render (pandoc & LaTeX) tersedia -----------------------
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

## 6b. Amankan karakter khusus LaTeX pada teks bebas -------------------------
esc_md <- function(x) gsub("([%_&#{}])", "\\\\\\1", x)

## 6c. Narasi interpretasi otomatis tiap soal (dibangun dari angka hasil, --
##     bukan template statis) -------------------------------------------------

# --- Interpretasi Soal 1b: ICC tiga butir pertama ---------------------------
urutan_b1  <- order(tabel_b_1$b_estimasi[1:3])
idx_mudah1 <- urutan_b1[1]
idx_sulit1 <- urutan_b1[3]

narasi_1b <- sprintf(paste0(
  "Ketiga kurva ICC pada Gambar 1 memiliki bentuk sigmoid (huruf S) yang khas model ",
  "Rasch, dengan kemiringan yang relatif seragam karena daya beda (a) diasumsikan ",
  "sama (a %s 1) untuk seluruh butir -- perbedaan yang tampak semata-mata terletak ",
  "pada pergeseran horizontal kurva, yang mencerminkan perbedaan parameter kesulitan ",
  "(b). %s memiliki b paling rendah (b = %.2f) di antara tiga butir pertama sehingga ",
  "kurvanya paling condong ke kiri: peserta berkemampuan rendah sekalipun ($\\theta$ di ",
  "sekitar %.2f) sudah memiliki peluang 0,50 menjawab benar. Sebaliknya, %s memiliki ",
  "b paling tinggi (b = %.2f) sehingga kurvanya bergeser paling ke kanan -- peluang ",
  "0,50 baru tercapai pada $\\theta$ yang jauh lebih tinggi, menandakan butir ini secara ",
  "relatif lebih sulit dan baru \"membedakan\" peserta pada rentang kemampuan yang ",
  "lebih tinggi."),
  "=", tabel_b_1$Butir[idx_mudah1], tabel_b_1$b_estimasi[idx_mudah1], tabel_b_1$b_estimasi[idx_mudah1],
  tabel_b_1$Butir[idx_sulit1], tabel_b_1$b_estimasi[idx_sulit1]
)

# --- Interpretasi Soal 2b: ICC (kategori) dua butir pertama -----------------
narasi_2b <- sprintf(paste0(
  "Gambar 2 menampilkan lima kurva probabilitas kategori untuk %s dan %s. Pola yang ",
  "konsisten dengan GRM tampak jelas: pada $\\theta$ rendah, probabilitas terbesar ada pada ",
  "kategori \"Sangat Tidak Setuju\"; seiring $\\theta$ meningkat, dominasi probabilitas ",
  "berpindah berurutan ke kategori-kategori berikutnya (Tidak Setuju, Netral, Setuju), ",
  "hingga pada $\\theta$ tinggi kategori \"Sangat Setuju\" menjadi yang paling mungkin ",
  "dipilih. Setiap kategori (kecuali kategori paling ekstrem) membentuk kurva unimodal ",
  "(satu puncak) karena kategori tersebut hanya \"unggul\" pada rentang $\\theta$ tertentu, ",
  "diapit oleh kategori di bawah dan di atasnya. %s memiliki daya beda (a = %.2f) yang ",
  "%s dibanding %s (a = %.2f), sehingga kurva kategorinya tampak %s curam -- daya beda ",
  "lebih tinggi berarti butir tersebut lebih tajam membedakan peserta dengan $\\theta$ ",
  "yang berdekatan."),
  tabel_grm$Butir[1], tabel_grm$Butir[2],
  tabel_grm$Butir[1], tabel_grm$a[1],
  ifelse(tabel_grm$a[1] >= tabel_grm$a[2], "lebih tinggi", "lebih rendah"),
  tabel_grm$Butir[2], tabel_grm$a[2],
  ifelse(tabel_grm$a[1] >= tabel_grm$a[2], "lebih", "kurang")
)

# --- Interpretasi Soal 3b: ICC butir kelima (PCM) ---------------------------
urutan_b3 <- sort(as.numeric(par_pcm[item_target_3, kolom_b_pcm]))
narasi_3b <- sprintf(paste0(
  "Gambar 3 menunjukkan empat kurva probabilitas skor (0, 1, 2, 3) untuk %s. Seperti ",
  "GRM, tiap kategori (selain skor minimum & maksimum) membentuk kurva unimodal yang ",
  "puncaknya bergeser ke kanan seiring naiknya kategori skor -- namun berbeda dari ",
  "GRM, urutan \"keunggulan\" tiap kategori pada PCM ditentukan oleh threshold ",
  "(step difficulty) yang tidak harus terurut menaik antarkategori, sehingga jarak ",
  "$\\theta$ antar-puncak kurva bisa tidak seragam. Threshold terurut butir ini adalah ",
  "%s, dengan rentang dari %.2f sampai %.2f -- rentang ini menggambarkan seberapa ",
  "lebar sebaran $\\theta$ yang dibutuhkan peserta untuk berpindah dari skor terendah ke ",
  "skor tertinggi pada butir tersebut."),
  tabel_pcm$Butir[item_target_3],
  paste(sprintf("%.2f", urutan_b3), collapse = "; "),
  min(urutan_b3), max(urutan_b3)
)

# --- Interpretasi Soal 4: informasi tes & reliabilitas ----------------------
info_per_butir_1 <- info_maks_dikotomi / n_butir_1
info_per_butir_2 <- info_maks_politomi / n_butir_2
model_lebih_informatif_per_butir <- if (info_per_butir_2 > info_per_butir_1) {
  "politomi (Soal 2, GRM)"
} else {
  "dikotomi (Soal 1, Rasch)"
}

narasi_4a <- sprintf(paste0(
  "Fungsi informasi tes $I(\\theta)$ pada Gambar 4 dan Gambar 5 sama-sama berbentuk ",
  "lonceng (unimodal), mencerminkan prinsip umum dalam IRT: sebuah tes paling ",
  "informatif (mengukur paling presisi) pada rentang $\\theta$ di sekitar kesulitan ",
  "rata-rata butir-butirnya, dan kurang informatif pada $\\theta$ ekstrem (sangat rendah ",
  "atau sangat tinggi) karena sedikit butir yang \"cocok\" mengukur di rentang tersebut. ",
  "Pada Soal 1 (dikotomi), informasi maksimum $I(\\theta)$ = %.2f dicapai pada $\\theta$ = ",
  "%.2f. Pada Soal 2 (politomi), informasi maksimum $I(\\theta)$ = %.2f dicapai pada ",
  "$\\theta$ = %.2f. Galat baku pengukuran $SE(\\theta) = 1/\\sqrt{I(\\theta)}$ berbanding ",
  "terbalik dengan informasi -- $SE(\\theta)$ paling kecil (pengukuran paling presisi) ",
  "justru pada titik $\\theta$ dengan informasi tertinggi tersebut."),
  info_maks_dikotomi, theta_maks_dikotomi, info_maks_politomi, theta_maks_politomi
)

catatan_teori_info <- if (info_per_butir_2 > info_per_butir_1) {
  paste0(
    "Hasil ini konsisten dengan prinsip umum dalam teori IRT: butir politomi (dengan ",
    "banyak kategori respons/threshold) pada dasarnya menggabungkan beberapa \"titik ",
    "potong\" kemampuan sekaligus dalam satu butir, sehingga secara teoretis berpotensi ",
    "menyumbang informasi lebih besar per butir dibanding butir dikotomi yang hanya ",
    "memiliki satu titik potong (benar/salah)."
  )
} else {
  paste0(
    "Secara teori IRT, butir politomi umumnya berpotensi menyumbang informasi lebih ",
    "besar per butir dibanding butir dikotomi karena memiliki beberapa titik potong ",
    "kemampuan sekaligus. Namun pada simulasi acak ini, hasilnya sebaliknya -- hal ini ",
    "wajar terjadi karena besar-kecilnya informasi juga sangat bergantung pada nilai ",
    "parameter daya beda (a) yang terealisasi secara acak pada tiap butir, bukan semata ",
    "ditentukan oleh jenis model (dikotomi/politomi) itu sendiri."
  )
}

narasi_4b <- sprintf(paste0(
  "Secara nilai total, informasi maksimum Soal 1 (I = %.2f, dari %d butir dikotomi) ",
  "%s dibanding Soal 2 (I = %.2f, dari %d butir politomi) -- namun perbandingan total ",
  "ini dipengaruhi oleh jumlah butir yang berbeda (20 vs 10), sehingga perbandingan ",
  "yang lebih adil adalah informasi rata-rata per butir: %.3f (Soal 1) berbanding ",
  "%.3f (Soal 2). Berdasarkan rasio per butir ini, model %s menyumbang informasi ",
  "lebih besar per butirnya. %s Dari sisi reliabilitas marginal, Soal 1 ",
  "memperoleh %.3f dan Soal 2 memperoleh %.3f; kedua nilai ini merupakan ringkasan ",
  "keseluruhan (rata-rata tertimbang) dari fungsi informasi tes di sepanjang ",
  "distribusi $\\theta$, sehingga selaras dengan pola pada fungsi informasi tes di atas."),
  info_maks_dikotomi, n_butir_1,
  ifelse(info_maks_dikotomi >= info_maks_politomi, "lebih tinggi", "lebih rendah"),
  info_maks_politomi, n_butir_2,
  info_per_butir_1, info_per_butir_2, model_lebih_informatif_per_butir,
  catatan_teori_info,
  rel_dikotomi, rel_politomi
)

## 6d. Tabel-tabel hasil dalam format Markdown (lewat knitr::kable) ----------
tabel_md_b1  <- knitr::kable(tabel_b_1, format = "markdown", digits = 3,
                              col.names = c("Butir", "b (benar)", "a (estimasi)", "b (estimasi)"))
tabel_md_grm <- knitr::kable(tabel_grm, format = "markdown", digits = 3)
tabel_md_pcm <- knitr::kable(tabel_pcm, format = "markdown", digits = 3)
tabel_md_rel <- knitr::kable(tabel_reliabilitas, format = "markdown", digits = 3,
                              col.names = c("Model", "Jumlah Butir", "Jumlah Responden", "Reliabilitas Marginal"))

## 6e. Siapkan lampiran teks: skrip R lengkap ---------------------------------
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

## 6f. Susun halaman sampul (raw LaTeX, agar tipografi rapi & simetris) ------
baris_sampul <- c(
  r"(\begin{titlepage})",
  r"(\centering)",
  r"(\vspace*{1.5cm})",
  sprintf(r"({\large \textbf{%s}}\\[0.4cm])", esc_md(jenis_ujian)),
  sprintf(r"({\LARGE \textbf{%s}}\\[1.2cm])", esc_md(matkul)),
  r"({\large Simulasi \& Analisis Data Dikotomi dan Politomi dengan Program R}\\[2cm])",
  r"(\renewcommand{\arraystretch}{1.7})",
  r"(\begin{tabular}{cl})",
  sprintf(r"(Nama & : %s \\)", esc_md(nama_mhs)),
  sprintf(r"(NIM & : %s \\)", esc_md(nim_mhs)),
  sprintf(r"(Program Studi & : %s \\)", esc_md(prodi_mhs)),
  sprintf(r"(Perguruan Tinggi & : %s \\)", esc_md(univ_mhs)),
  r"(\end{tabular})",
  r"(\par)",
  r"(\vspace{1.5cm})",
  sprintf(r"(Tanggal Analisis: %s)", format(Sys.Date(), "%d %B %Y")),
  r"(\vfill)",
  r"(\end{titlepage})",
  ""
)

## 6g. Bangun isi file R Markdown (.Rmd) secara terprogram -------------------
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
  r"(  - \DefineVerbatimEnvironment{Highlighting}{Verbatim}{breaklines,breakanywhere,fontsize=\small,commandchars=\\\{\}})",
  r"(  - \DefineVerbatimEnvironment{verbatim}{Verbatim}{breaklines,breakanywhere,fontsize=\small})",
  "---",
  "",
  baris_sampul,
  r"(\newpage)",
  "",
  r"(\tableofcontents)",
  "",
  r"(\newpage)",
  "",
  "# Soal 1: Data Dikotomi (Model Rasch)",
  "",
  sprintf(paste0("Data disimulasikan untuk **%d butir** dan **%d responden** menggunakan model ",
                 "Rasch (IRT 1 parameter) melalui `mirt::simdata()`, kemudian diestimasi ulang ",
                 "dengan `mirt(..., itemtype = \"Rasch\")` untuk memperoleh parameter kesulitan ",
                 "butir (b)."), n_butir_1, n_responden_1),
  "",
  "## a. Parameter Kesulitan Butir (b)",
  "",
  "Tabel berikut membandingkan parameter kesulitan butir (b) yang digunakan untuk membangkitkan data (\"b benar\") dengan parameter (b) hasil estimasi ulang model Rasch:",
  "",
  tabel_md_b1,
  "",
  r"(\newpage)",
  "",
  "## b. Item Characteristic Curve (ICC) Tiga Butir Pertama",
  "",
  "![ICC Tiga Butir Pertama - Model Rasch](S1_ICC_TigaButirPertama.png){width=90%}",
  "",
  narasi_1b,
  "",
  r"(\newpage)",
  "",
  "# Soal 2: Data Politomi (Graded Response Model / GRM)",
  "",
  sprintf(paste0("Data disimulasikan untuk **%d butir** dan **%d responden** dengan skala Likert ",
                 "%d kategori (Sangat Tidak Setuju - Sangat Setuju) menggunakan Graded Response ",
                 "Model melalui `mirt::simdata(itemtype = \"graded\")`, kemudian diestimasi ulang ",
                 "dengan `mirt(..., itemtype = \"graded\")`."), n_butir_2, n_responden_2, n_kategori_2),
  "",
  "## a. Parameter Daya Beda (a) dan Kesulitan/Threshold (b1-b4)",
  "",
  tabel_md_grm,
  "",
  r"(\newpage)",
  "",
  "## b. Item Characteristic Curve (ICC) Dua Butir Pertama",
  "",
  "![ICC (Kurva Kategori) Dua Butir Pertama - GRM](S2_ICC_DuaButirPertama.png){width=95%}",
  "",
  narasi_2b,
  "",
  r"(\newpage)",
  "",
  "# Soal 3: Data Politomi (Partial Credit Model / PCM)",
  "",
  sprintf(paste0("Data disimulasikan untuk **%d butir** dan **%d responden**, masing-masing dengan ",
                 "%d kategori skor (0, 1, 2, 3), menggunakan Partial Credit Model (kasus khusus ",
                 "GPCM dengan daya beda a = 1) melalui `mirt::simdata(itemtype = \"gpcm\")`, ",
                 "kemudian diestimasi ulang dengan `mirt(..., itemtype = \"Rasch\")` -- pada mirt, ",
                 "itemtype \"Rasch\" untuk data politomi menghasilkan Partial Credit Model."),
          n_butir_3, n_responden_3, n_kategori_3),
  "",
  "## a. Parameter Threshold (Kesulitan Kategori) Tiap Butir",
  "",
  tabel_md_pcm,
  "",
  r"(\newpage)",
  "",
  sprintf("## b. Item Characteristic Curve (ICC) %s", tabel_pcm$Butir[item_target_3]),
  "",
  sprintf("![ICC %s - Partial Credit Model](S3_ICC_Butir5.png){width=90%%}", tabel_pcm$Butir[item_target_3]),
  "",
  narasi_3b,
  "",
  r"(\newpage)",
  "",
  "# Soal 4: Reliabilitas & Informasi Tes (Model Unidimensional)",
  "",
  "Bagian ini menggunakan model hasil Soal 1 (dikotomi, Rasch) dan Soal 2 (politomi, GRM) untuk menghitung reliabilitas dan fungsi informasi tes pada berbagai tingkat kemampuan peserta ($\\theta$).",
  "",
  "## a. Plot Informasi Tes sebagai Fungsi dari Kemampuan Peserta",
  "",
  "![Fungsi Informasi Tes - Soal 1 (Dikotomi)](S4_Info_Dikotomi.png){width=85%}",
  "",
  "![Fungsi Informasi Tes - Soal 2 (Politomi)](S4_Info_Politomi.png){width=85%}",
  "",
  narasi_4a,
  "",
  r"(\newpage)",
  "",
  "## b. Perbandingan Informasi Tes: Dikotomi vs Politomi",
  "",
  "![Perbandingan Informasi Tes](S4_Perbandingan_Informasi.png){width=90%}",
  "",
  "Tabel reliabilitas marginal kedua model:",
  "",
  tabel_md_rel,
  "",
  narasi_4b,
  "",
  r"(\newpage)",
  "",
  "# Lampiran: Skrip R Lengkap",
  "",
  "```r",
  baris_skrip,
  "```"
)

path_rmd <- file.path(folder_kerja, "Laporan_UTS_TeoriResponsButir.Rmd")
writeLines(rmd, path_rmd, useBytes = TRUE)

cat("\nMerender laporan PDF (proses LaTeX via pandoc, mohon tunggu)...\n")

rmarkdown::render(
  input       = path_rmd,
  output_file = "Laporan_UTS_TeoriResponsButir.pdf",
  output_dir  = folder_kerja,
  quiet       = TRUE
)

cat("\n>> LAPORAN PDF berhasil dibuat: ", file.path(folder_kerja, "Laporan_UTS_TeoriResponsButir.pdf"), "\n")
cat(">> Seluruh file pendukung (CSV & PNG) tersimpan di folder kerja:\n   ", folder_kerja, "\n")
