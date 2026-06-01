---
config:
  theme: neutral
---
erDiagram
	direction TB

	USER {
		BIGINT id PK ""
		VARCHAR name ""
		VARCHAR email ""
		DATETIME email_verified_at ""
		VARCHAR password ""
		VARCHAR phone ""
		TEXT bio ""
		LONGTEXT avatar ""
		VARCHAR remember_token ""
		DATETIME created_at ""
		DATETIME updated_at ""
	}

	ADMIN {
		BIGINT id PK ""
		VARCHAR name ""
		VARCHAR email ""
		VARCHAR password ""
		VARCHAR remember_token ""
		DATETIME created_at ""
		DATETIME updated_at ""
	}

	BANK {
		BIGINT id PK ""
		VARCHAR name ""
		VARCHAR email ""
		VARCHAR password ""
		BIGINT bank_id FK ""
		VARCHAR remember_token ""
		DATETIME created_at ""
		DATETIME updated_at ""
	}

	BUSINESS_PROFILE {
		BIGINT id PK ""
		BIGINT user_id FK ""
		VARCHAR nama_usaha ""
		VARCHAR bidang_usaha ""
		TEXT alamat_usaha ""
		VARCHAR lama_usaha ""
		VARCHAR jumlah_karyawan ""
		VARCHAR nib_path ""
		VARCHAR npwp_path ""
		VARCHAR ktp_path ""
		VARCHAR kk_path ""
		VARCHAR selfie_ktp_path ""
		VARCHAR ttd_path ""
		VARCHAR rekening_path ""
		DECIMAL omzet_bulan_ini ""
		VARCHAR foto_usaha_path ""
		VARCHAR kontrak_path ""
		DECIMAL cicilan_berjalan ""
		VARCHAR bukti_pelunasan_path ""
		INT skor_profitabilitas ""
		INT skor_legalitas ""
		INT skor_tren_omzet ""
		INT skor_kolektibilitas ""
		INT skor_keberlanjutan ""
		INT skor_kapasitas_utang ""
		INT skor_total ""
		DATETIME created_at ""
		DATETIME updated_at ""
	}

	OMZET {
		BIGINT id PK ""
		BIGINT user_id FK ""
		INT month ""
		INT year ""
		DECIMAL amount ""
		DATETIME created_at ""
		DATETIME updated_at ""
	}

	SUBMISSION {
		BIGINT id PK ""
		VARCHAR reference_code ""
		BIGINT user_id FK ""
		BIGINT bank_id FK ""
		VARCHAR nama_produk ""
		VARCHAR status ""
		VARCHAR nominal_pinjaman ""
		VARCHAR tenor ""
		VARCHAR nama_usaha ""
		VARCHAR bidang_usaha ""
		VARCHAR alamat_usaha ""
		VARCHAR pemohon_phone ""
		TEXT pemohon_alamat ""
		DECIMAL cicilan_per_bulan ""
		VARCHAR ktp_nik ""
		VARCHAR ktp_nama ""
		VARCHAR ktp_upload_path ""
		VARCHAR nib_upload_path ""
		INT skor_total ""
		INT skor_profitabilitas ""
		INT skor_legalitas ""
		INT skor_tren_omzet ""
		INT skor_kolektibilitas ""
		INT skor_keberlanjutan ""
		INT skor_kapasitas_utang ""
		INT omzet_year ""
		JSON omzet_data ""
		TEXT bank_message ""
		DATETIME created_at ""
		DATETIME updated_at ""
	}

	NOTIFICATION {
		BIGINT id PK ""
		BIGINT user_id FK ""
		VARCHAR title ""
		VARCHAR subject ""
		TEXT message ""
		DATETIME read_at ""
		DATETIME created_at ""
		DATETIME updated_at ""
	}

	OTP {
		BIGINT id PK ""
		VARCHAR email ""
		VARCHAR phone ""
		VARCHAR type ""
		VARCHAR otp ""
		DATETIME expires_at ""
		DATETIME created_at ""
		DATETIME updated_at ""
	}

	BANK_CARD {
		BIGINT id PK ""
		VARCHAR nama_bank ""
		VARCHAR nama_produk ""
		VARCHAR bunga ""
		VARCHAR cicilan ""
		INT skor_kecocokan ""
		INT min_score ""
		TEXT deskripsi ""
		BIGINT plafon_min ""
		BIGINT plafon_max ""
		INT tenor_min ""
		INT tenor_max ""
		DECIMAL bunga_persen ""
		JSON syarat ""
		BOOLEAN is_promoted ""
		VARCHAR promo_image ""
		DATETIME created_at ""
		DATETIME updated_at ""
	}

	BANK_CATEGORY {
		BIGINT id PK ""
		VARCHAR name ""
		VARCHAR slug ""
		INT sort_order ""
		DATETIME created_at ""
		DATETIME updated_at ""
	}

	BANK_CATEGORY_PIVOT {
		BIGINT id PK ""
		BIGINT bank_id FK ""
		BIGINT category_id FK ""
		DATETIME created_at ""
		DATETIME updated_at ""
	}

	AD {
		BIGINT id PK ""
		VARCHAR badge ""
		VARCHAR title ""
		TEXT description ""
		VARCHAR cta ""
		VARCHAR image_url ""
		BOOLEAN is_active ""
		INT sort_order ""
		VARCHAR bg_color_from ""
		VARCHAR bg_color_to ""
		DATETIME created_at ""
		DATETIME updated_at ""
	}

	ARTICLE {
		BIGINT id PK ""
		VARCHAR title ""
		TEXT excerpt ""
		VARCHAR image_url ""
		BOOLEAN is_active ""
		INT sort_order ""
		DATETIME created_at ""
		DATETIME updated_at ""
	}

	%% Relasi Antar Tabel
	USER ||--o| BUSINESS_PROFILE : "memiliki"
	USER ||--o{ OMZET : "mencatat"
	USER ||--o{ SUBMISSION : "mengajukan"
	USER ||--o{ NOTIFICATION : "menerima"
	USER ||--o{ OTP : "meminta"
	
    BANK ||--o{ BANK_CARD : "memiliki_anggota"
	BANK ||--o{ SUBMISSION : "memproses"
	BANK ||--o{ NOTIFICATION : "memberi"

	BANK_CARD ||--o{ BANK_CATEGORY_PIVOT : "dikelompokkan"
	BANK_CATEGORY ||--o{ BANK_CATEGORY_PIVOT : "mengelompokkan"
	
	ADMIN ||--o{ AD : "mengelola"
	ADMIN ||--o{ ARTICLE : "mengelola"
