import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  createAdminAd,
  createAdminArticle,
  createAdminBank,
  createAdminBankCategory,
  deleteAdminBank,
  deleteAdminBankCategory,
  getAdminAds,
  getAdminArticles,
  getAdminBankCategories,
  getAdminBanks,
  getAdminUserDocuments,
  updateAdminBank,
  updateAdminBankCategory,
  changePassword,
  updateAdminArticle,
  deleteAdminArticle,
  deleteAdminAd,
  updateAdminAd,
} from '../services/api';
import {
  Eye,
  Edit2,
  Trash2,
  Plus,
  Sparkles,
  Image as ImageIcon,
  Check,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Globe,
  Upload,
  Loader2,
  Search,
  Megaphone,
  CreditCard,
  Tags,
  FolderOpen,
  Lock,
  LogOut,
  LayoutDashboard,
  TrendingUp,
  UserCheck,
  ArrowLeft,
  Home,
} from 'lucide-react';

const emptyAd = { badge: '', title: '', description: '', cta: '', sort_order: 0, is_active: true, bg_color_from: '#001D4A', bg_color_to: '#0052CC' };
const emptyArticle = { title: '', excerpt: '', image_url: '', sort_order: 0, is_active: 0 };
const emptyCategory = { name: '', sort_order: 0 };
const emptyBank = {
  nama_bank: '',
  category_ids: [],
  nama_produk: '',
  bunga: '',
  cicilan: '',
  skor_kecocokan: 80,
  min_score: 350,
  deskripsi: '',
  plafon_min: 1000000,
  plafon_max: 50000000,
  tenor_min: 6,
  tenor_max: 36,
  bunga_persen: 0.5,
  syarat: '',
};

export default function AdminDashboard() {
  const [ads, setAds] = useState([]);
  const [articles, setArticles] = useState([]);
  const [banks, setBanks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [adForm, setAdForm] = useState(emptyAd);
  const [articleForm, setArticleForm] = useState(emptyArticle);
  const [bankForm, setBankForm] = useState(emptyBank);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [loading, setLoading] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState('');
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [rowCategoryMap, setRowCategoryMap] = useState({});
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [bankDetailForm, setBankDetailForm] = useState(null);
  const [bankDetailOpen, setBankDetailOpen] = useState(false);
  const [savingBankDetail, setSavingBankDetail] = useState(false);
  const [articleImageFile, setArticleImageFile] = useState(null);
  const [adImageFile, setAdImageFile] = useState(null);
  const [adImagePreviewUrl, setAdImagePreviewUrl] = useState(null);

  // States for filtering and searching ads
  const [adSearchQuery, setAdSearchQuery] = useState('');
  const [adStatusFilter, setAdStatusFilter] = useState('all'); // 'all', 'active', 'inactive'

  // New Article States for premium features
  const [editingArticleId, setEditingArticleId] = useState('');
  const [articlePreviewUrl, setArticlePreviewUrl] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingArticle, setReviewingArticle] = useState(null);
  const [savingArticle, setSavingArticle] = useState(false);
  const adFileInputRef = useRef(null);
  const articleSectionRef = useRef(null);
  const articleFileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('ads-articles');
  const navigate = useNavigate();

  const handleDeleteAd = async (id) => {
    const ok = window.confirm('Apakah Anda yakin ingin menghapus iklan ini?');
    if (!ok) return;
    try {
      await deleteAdminAd(id);
      toast.success('Iklan berhasil dihapus.');
      loadAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Gagal menghapus iklan.');
    }
  };

  const handleToggleAdStatus = async (ad) => {
    try {
      await updateAdminAd(ad.id, { is_active: !ad.is_active });
      toast.success(ad.is_active ? 'Iklan dinonaktifkan dari beranda.' : 'Iklan diaktifkan di beranda!');
      loadAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Gagal mengubah status iklan.');
    }
  };

  const primaryBtnClass = 'bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all';
  const secondaryBtnClass = 'px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all';
  const dangerBtnClass = 'text-red-500 hover:text-red-700 hover:underline';
  const orderedCategories = [...categories].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const inputClass = 'w-full px-3 py-2 border rounded-lg border-slate-200';

  const loadAll = async () => {
    setLoading(true);
    try {
      const [adRows, articleRows, bankRows, userRows, categoryRows] = await Promise.all([
        getAdminAds(),
        getAdminArticles(),
        getAdminBanks(),
        getAdminUserDocuments(),
        getAdminBankCategories(),
      ]);
      setAds(adRows || []);
      setArticles(articleRows || []);
      setBanks(bankRows || []);
      setUsers(userRows || []);
      setCategories(categoryRows || []);
      setRowCategoryMap(Object.fromEntries((bankRows || []).map((bank) => [bank.id, bank.category_id || ''])));
      if ((!bankForm.category_ids || bankForm.category_ids.length === 0) && categoryRows?.length) {
        const registered = categoryRows.find((cat) => cat.name === 'terdaftar');
        setBankForm((prev) => ({ ...prev, category_ids: registered ? [registered.id] : [categoryRows[0].id] }));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Gagal ambil data admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll().catch(() => null);
  }, []);

  const createCategory = async (e) => {
    e.preventDefault();
    try {
      await createAdminBankCategory({ name: categoryForm.name, sort_order: Number(categoryForm.sort_order || 0) });
      setCategoryForm(emptyCategory);
      toast.success('Kategori berhasil ditambah.');
      loadAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Tambah kategori gagal.');
    }
  };

  const saveCategoryEdit = async (id) => {
    try {
      await updateAdminBankCategory(id, { name: editingCategoryName });
      setEditingCategoryId('');
      setEditingCategoryName('');
      toast.success('Kategori diperbarui.');
      loadAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Edit kategori gagal.');
    }
  };

  const moveCategoryPosition = async (categoryId, direction) => {
    const currentIndex = orderedCategories.findIndex((cat) => cat.id === categoryId);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= orderedCategories.length) return;

    const current = orderedCategories[currentIndex];
    const target = orderedCategories[targetIndex];

    try {
      await Promise.all([
        updateAdminBankCategory(current.id, { sort_order: target.sort_order }),
        updateAdminBankCategory(target.id, { sort_order: current.sort_order }),
      ]);
      toast.success('Posisi kategori berhasil diubah.');
      loadAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Gagal memindahkan posisi kategori.');
    }
  };

  const createBank = async (e) => {
    e.preventDefault();
    if (!bankForm.category_ids || bankForm.category_ids.length === 0) {
      toast.error('Pilih minimal satu kategori bank.');
      return;
    }
    try {
      await createAdminBank({
        ...bankForm,
        category_ids: bankForm.category_ids.map(Number),
        syarat: bankForm.syarat.split('\n').map((v) => v.trim()).filter(Boolean),
      });
      setBankForm({
        ...emptyBank,
        category_ids: bankForm.category_ids,
      });
      toast.success('Kartu bank berhasil ditambah.');
      loadAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Tambah kartu bank gagal.');
    }
  };

  const moveBankCategory = async (bankId) => {
    try {
      await updateAdminBank(bankId, { category_ids: [Number(rowCategoryMap[bankId])] });
      toast.success('Kategori bank diperbarui.');
      loadAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Pindah kategori gagal.');
    }
  };

  const openBankDetail = (bank) => {
    setBankDetailForm({
      id: bank.id,
      nama_bank: bank.nama_bank ?? '',
      category_ids: bank.category_ids ?? (bank.category_id ? [bank.category_id] : []),
      nama_produk: bank.nama_produk ?? '',
      bunga: bank.bunga ?? '',
      cicilan: bank.cicilan ?? '',
      skor_kecocokan: bank.skor_kecocokan ?? 80,
      min_score: bank.min_score ?? 350,
      deskripsi: bank.deskripsi ?? '',
      plafon_min: bank.plafon_min ?? 1000000,
      plafon_max: bank.plafon_max ?? 50000000,
      tenor_min: bank.tenor_min ?? 6,
      tenor_max: bank.tenor_max ?? 36,
      bunga_persen: bank.bunga_persen ?? 0.5,
      syarat: Array.isArray(bank.syarat) ? bank.syarat.join('\n') : (bank.syarat ?? ''),
    });
    setBankDetailOpen(true);
  };

  const saveBankDetail = async (e) => {
    e.preventDefault();
    if (!bankDetailForm?.id) return;
    if (!bankDetailForm.category_ids || bankDetailForm.category_ids.length === 0) {
      toast.error('Pilih minimal satu kategori bank.');
      return;
    }
    setSavingBankDetail(true);
    try {
      await updateAdminBank(bankDetailForm.id, {
        nama_bank: bankDetailForm.nama_bank,
        category_ids: bankDetailForm.category_ids.map(Number),
        nama_produk: bankDetailForm.nama_produk,
        bunga: bankDetailForm.bunga,
        cicilan: bankDetailForm.cicilan,
        skor_kecocokan: Number(bankDetailForm.skor_kecocokan),
        min_score: Number(bankDetailForm.min_score),
        deskripsi: bankDetailForm.deskripsi,
        plafon_min: Number(bankDetailForm.plafon_min),
        plafon_max: Number(bankDetailForm.plafon_max),
        tenor_min: Number(bankDetailForm.tenor_min),
        tenor_max: Number(bankDetailForm.tenor_max),
        bunga_persen: Number(bankDetailForm.bunga_persen),
        syarat: (bankDetailForm.syarat || '').split('\n').map((v) => v.trim()).filter(Boolean),
      });
      toast.success('Detail bank berhasil diperbarui.');
      setBankDetailOpen(false);
      setBankDetailForm(null);
      loadAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Gagal menyimpan detail bank.');
    } finally {
      setSavingBankDetail(false);
    }
  };

  const handleAdImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setAdImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setAdImagePreviewUrl(url);
    } else {
      setAdImagePreviewUrl(null);
    }
  };

  const resetAdForm = () => {
    setAdForm(emptyAd);
    setAdImageFile(null);
    setAdImagePreviewUrl(null);
    if (adFileInputRef.current) adFileInputRef.current.value = '';
  };

  const createAd = async (e) => {
    e.preventDefault();
    if (!adImageFile) {
      toast.error('Silakan pilih gambar banner terlebih dahulu.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('badge', adForm.badge);
      formData.append('title', adForm.title);
      formData.append('description', adForm.description || '');
      formData.append('cta', adForm.cta || 'Pelajari');
      formData.append('sort_order', String(adForm.sort_order || 0));
      formData.append('is_active', adForm.is_active ? '1' : '0');
      formData.append('bg_color_from', adForm.bg_color_from || '#001D4A');
      formData.append('bg_color_to', adForm.bg_color_to || '#0052CC');
      formData.append('image', adImageFile);
      await createAdminAd(formData);
      resetAdForm();
      toast.success('Iklan berhasil diterbitkan dan tampil di beranda user!');
      loadAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Tambah iklan gagal.');
    }
  };

  const handleArticleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setArticleImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setArticlePreviewUrl(url);
    } else {
      setArticlePreviewUrl(null);
    }
  };

  const createOrUpdateArticle = async (e) => {
    e.preventDefault();
    if (!articleForm.title.trim()) {
      toast.error('Judul artikel wajib diisi.');
      return;
    }

    setSavingArticle(true);
    try {
      const formData = new FormData();
      formData.append('title', articleForm.title || '');
      formData.append('excerpt', articleForm.excerpt || '');
      formData.append('is_active', articleForm.is_active ? '1' : '0');
      formData.append('sort_order', String(articleForm.sort_order || 0));

      if (articleImageFile) {
        formData.append('image', articleImageFile);
      } else if (articleForm.image_url) {
        formData.append('image_url', articleForm.image_url);
      }

      if (editingArticleId) {
        await updateAdminArticle(editingArticleId, formData);
        toast.success('Artikel berhasil diperbarui.');
      } else {
        await createAdminArticle(formData);
        toast.success('Artikel baru berhasil disimpan sebagai Draft.');
      }

      cancelArticleEdit();
      loadAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Gagal menyimpan artikel.');
    } finally {
      setSavingArticle(false);
    }
  };

  const toggleArticleStatus = async (article) => {
    try {
      const newStatus = article.is_active ? 0 : 1;
      await updateAdminArticle(article.id, {
        title: article.title,
        excerpt: article.excerpt,
        is_active: newStatus,
        sort_order: article.sort_order,
      });
      toast.success(newStatus ? 'Artikel berhasil Diterbitkan!' : 'Artikel ditarik ke Draft.');
      loadAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Gagal mengubah status artikel.');
    }
  };

  const startEditArticle = (article) => {
    setArticleForm({
      title: article.title || '',
      excerpt: article.excerpt || '',
      image_url: article.image_url || '',
      sort_order: article.sort_order ?? 0,
      is_active: article.is_active ? 1 : 0,
    });
    setEditingArticleId(article.id);
    setArticlePreviewUrl(article.image_url || null);
    setArticleImageFile(null);

    // Smooth scroll to the form
    articleSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelArticleEdit = () => {
    setArticleForm(emptyArticle);
    setEditingArticleId('');
    setArticlePreviewUrl(null);
    setArticleImageFile(null);
    if (articleFileInputRef.current) {
      articleFileInputRef.current.value = '';
    }
  };

  const handleDeleteArticle = async (article) => {
    const ok = window.confirm(`Apakah Anda yakin ingin menghapus artikel "${article.title}"?`);
    if (!ok) return;

    try {
      await deleteAdminArticle(article.id);
      toast.success('Artikel berhasil dihapus.');
      loadAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Gagal menghapus artikel.');
    }
  };

  const handleChangeAdminPassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      toast.error('Konfirmasi password baru tidak sama.');
      return;
    }

    try {
      await changePassword(
        passwordForm.current_password,
        passwordForm.new_password,
        passwordForm.new_password_confirmation
      );
      toast.success('Password admin berhasil diubah.');
      setPasswordForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Gagal mengubah password admin.');
    }
  };

  const filteredAds = ads.filter(ad => {
    const matchesSearch = 
      (ad.title || '').toLowerCase().includes(adSearchQuery.toLowerCase()) ||
      (ad.badge || '').toLowerCase().includes(adSearchQuery.toLowerCase()) ||
      (ad.description || '').toLowerCase().includes(adSearchQuery.toLowerCase());
    
    const matchesStatus = 
      adStatusFilter === 'all' || 
      (adStatusFilter === 'active' && ad.is_active) || 
      (adStatusFilter === 'inactive' && !ad.is_active);
      
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col lg:flex-row font-sans">
      
      {/* ─── BILAH SISI (SIDEBAR) PREMIUM ─── */}
      <aside className="w-full lg:w-72 bg-[#090D1A] text-slate-200 flex flex-col shrink-0 border-b lg:border-b-0 lg:border-r border-slate-800 shadow-2xl relative z-40">
        
        {/* Header Brand */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-black text-lg">
              F
            </div>
            <div>
              <h1 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
                FinBank Link
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">PRO</span>
              </h1>
              <p className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">Portal Kontrol Admin</p>
            </div>
          </div>
        </div>

        {/* Info Profil Admin */}
        <div className="p-4 border-b border-slate-800/40">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/60 backdrop-blur-md flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <UserCheck size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Status Akses</p>
              <p className="text-xs font-black text-white truncate">Administrator Utama</p>
            </div>
          </div>
        </div>

        {/* Menu Navigasi Utama */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-3 block mb-3">Navigasi Panel</span>
          
          {/* Menu Tab 1: Iklan & Artikel */}
          <button
            onClick={() => setActiveTab('ads-articles')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold transition-all duration-300 relative group cursor-pointer ${
              activeTab === 'ads-articles'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Megaphone size={16} className={activeTab === 'ads-articles' ? 'text-white' : 'text-slate-400 group-hover:text-blue-400 transition-colors'} />
            <span className="flex-1 text-left">Iklan &amp; Artikel Edukasi</span>
            {activeTab === 'ads-articles' && (
              <div className="w-1.5 h-6 bg-white rounded-full absolute right-2" />
            )}
          </button>

          {/* Menu Tab 2: Kartu Bank & Kategori */}
          <button
            onClick={() => setActiveTab('banks-categories')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold transition-all duration-300 relative group cursor-pointer ${
              activeTab === 'banks-categories'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <CreditCard size={16} className={activeTab === 'banks-categories' ? 'text-white' : 'text-slate-400 group-hover:text-blue-400 transition-colors'} />
            <span className="flex-1 text-left">Kartu Bank &amp; Kategori</span>
            {activeTab === 'banks-categories' && (
              <div className="w-1.5 h-6 bg-white rounded-full absolute right-2" />
            )}
          </button>

          {/* Menu Tab 3: Berkas User */}
          <button
            onClick={() => setActiveTab('user-documents')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold transition-all duration-300 relative group cursor-pointer ${
              activeTab === 'user-documents'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <FolderOpen size={16} className={activeTab === 'user-documents' ? 'text-white' : 'text-slate-400 group-hover:text-blue-400 transition-colors'} />
            <span className="flex-1 text-left">Berkas User &amp; Keamanan</span>
            {activeTab === 'user-documents' && (
              <div className="w-1.5 h-6 bg-white rounded-full absolute right-2" />
            )}
          </button>
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-800/80 space-y-2 shrink-0">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 py-3 border border-slate-800 hover:border-slate-700 bg-slate-900/30 hover:bg-slate-900/60 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <Home size={14} />
            <span>Kembali ke Beranda</span>
          </button>
        </div>
      </aside>

      {/* ─── AREA KONTEN UTAMA (RIGHT CONTENT) ─── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30 shadow-sm shadow-slate-100/30">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              <span>ADMIN PANEL</span>
              <span>/</span>
              <span className="text-blue-600">
                {activeTab === 'ads-articles' && 'Iklan & Artikel'}
                {activeTab === 'banks-categories' && 'Kartu Bank & Kategori'}
                {activeTab === 'user-documents' && 'Berkas User & Keamanan'}
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
              {activeTab === 'ads-articles' && 'Manajemen Iklan & Edukasi'}
              {activeTab === 'banks-categories' && 'Pengaturan Kartu Bank'}
              {activeTab === 'user-documents' && 'Audit Dokumen & Keamanan'}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={loadAll}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 disabled:opacity-50 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin text-blue-600" />
                  <span>Sinkronisasi...</span>
                </>
              ) : (
                <>
                  <Globe size={13} className="text-slate-400" />
                  <span>Muat Ulang Data</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Konten Utama */}
        <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] w-full mx-auto">
          
          {/* 📢 BARIS KARTU RINGKASAN STATISTIK (QUICK STATS CARDS) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            
            {/* Stats 1: Total Iklan */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="space-y-1 z-10">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Total Iklan Banner</p>
                <h3 className="text-2xl font-black text-slate-800">{ads.length}</h3>
                <p className="text-[10px] text-slate-400 font-medium">Aktif dipasang di beranda</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300 shrink-0">
                <Megaphone size={20} />
              </div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-indigo-50/20 rounded-full blur-xl pointer-events-none" />
            </div>

            {/* Stats 2: Total Artikel */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="space-y-1 z-10">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Artikel Edukasi</p>
                <h3 className="text-2xl font-black text-slate-800">{articles.length}</h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  <strong className="text-emerald-600">{articles.filter(a => a.is_active).length} Terbit</strong> • {articles.filter(a => !a.is_active).length} Draft
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform duration-300 shrink-0">
                <Sparkles size={20} />
              </div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-amber-50/20 rounded-full blur-xl pointer-events-none" />
            </div>

            {/* Stats 3: Total Bank */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="space-y-1 z-10">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Mitra Perbankan</p>
                <h3 className="text-2xl font-black text-slate-800">{banks.length}</h3>
                <p className="text-[10px] text-slate-400 font-medium">Terbagi dalam {categories.length} kategori</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300 shrink-0">
                <CreditCard size={20} />
              </div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-emerald-50/20 rounded-full blur-xl pointer-events-none" />
            </div>

            {/* Stats 4: Total User Berkas */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="space-y-1 z-10">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Nasabah Terdaftar</p>
                <h3 className="text-2xl font-black text-slate-800">{users.length}</h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  {users.reduce((acc, u) => acc + (u.documents?.length || 0), 0)} berkas terunggah
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform duration-300 shrink-0">
                <FolderOpen size={20} />
              </div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-violet-50/20 rounded-full blur-xl pointer-events-none" />
            </div>

          </div>

          {/* 📢 TAB 1: IKLAN & ARTIKEL EDUKASI ── */}
          {activeTab === 'ads-articles' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Tambah Iklan & Board Panel */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                
                {/* Form Tambah Iklan */}
                <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                    <Megaphone size={16} className="text-blue-500" />
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Buat Iklan Banner</h3>
                  </div>

                  {/* Live Preview Banner — persis seperti tampilan user */}
                  <div
                    className="relative overflow-hidden h-36 w-full group"
                    style={{ background: `linear-gradient(to right, ${adForm.bg_color_from || '#001D4A'}, ${adForm.bg_color_to || '#0052CC'})` }}
                  >
                    <div className="absolute top-[-50%] left-[-10%] w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Gambar di kanan */}
                    {adImagePreviewUrl && (
                      <div 
                        className="absolute right-0 top-0 h-full w-[45%] overflow-hidden"
                        style={{
                          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 40%)',
                          maskImage: 'linear-gradient(to right, transparent 0%, black 40%)',
                        }}
                      >
                        <img
                          src={adImagePreviewUrl}
                          alt="preview"
                          className="h-full w-full object-cover object-center scale-105 group-hover:scale-110"
                          style={{ transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)' }}
                        />
                      </div>
                    )}

                    {/* Konten kiri */}
                    <div className="relative z-30 px-5 max-w-[60%] flex flex-col items-start justify-center h-full">
                      <div className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-[8px] font-black text-white tracking-widest uppercase mb-2">
                        {adForm.badge || 'BADGE PENAWARAN'}
                      </div>
                      <h3 className="text-white text-base font-extrabold leading-tight mb-1 drop-shadow-md">
                        {adForm.title || 'Judul Iklan Anda'}
                      </h3>
                      {adForm.description && (
                        <p className="text-white/85 text-[10px] leading-relaxed mb-2 line-clamp-2">{adForm.description}</p>
                      )}
                      <div className="px-4 py-1.5 bg-white text-gray-900 text-[10px] font-bold rounded-full flex items-center gap-1.5">
                        {adForm.cta || 'Pelajari'}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3 stroke-2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </div>

                    {/* Label preview */}
                    <span className="absolute bottom-2 right-3 text-[8px] font-bold text-white/50 uppercase tracking-widest">Preview Live</span>
                  </div>

                  <form onSubmit={createAd} className="p-5 space-y-3.5">

                    {/* Upload Gambar */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-600">Gambar Banner <span className="text-red-500">*</span></label>
                      <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30 rounded-xl transition-all cursor-pointer overflow-hidden">
                        <input
                          type="file"
                          ref={adFileInputRef}
                          accept="image/jpg,image/jpeg,image/png"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={handleAdImageChange}
                        />
                        {adImagePreviewUrl ? (
                          <div className="flex items-center gap-3 p-3">
                            <img src={adImagePreviewUrl} alt="preview" className="w-16 h-12 object-cover rounded-lg border border-slate-200 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-700 truncate">{adImageFile?.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Klik untuk ganti gambar</p>
                            </div>
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 ml-auto" />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-5 px-3 text-center">
                            <Upload className="text-slate-400 mb-1.5 w-6 h-6" />
                            <p className="text-xs font-bold text-slate-600">Klik atau seret gambar ke sini</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG — maks. 5MB</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Warna Gradien */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-600">Warna Latar Gradien</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-400 font-medium">Warna Kiri</p>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={adForm.bg_color_from}
                              onChange={(e) => setAdForm({ ...adForm, bg_color_from: e.target.value })}
                              className="w-9 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                            />
                            <input
                              type="text"
                              value={adForm.bg_color_from}
                              maxLength={7}
                              onChange={(e) => setAdForm({ ...adForm, bg_color_from: e.target.value })}
                              className="flex-1 px-2 py-1.5 border rounded-lg border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-400 font-medium">Warna Kanan</p>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={adForm.bg_color_to}
                              onChange={(e) => setAdForm({ ...adForm, bg_color_to: e.target.value })}
                              className="w-9 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                            />
                            <input
                              type="text"
                              value={adForm.bg_color_to}
                              maxLength={7}
                              onChange={(e) => setAdForm({ ...adForm, bg_color_to: e.target.value })}
                              className="flex-1 px-2 py-1.5 border rounded-lg border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                      {/* Gradient strip preview */}
                      <div
                        className="h-3 rounded-full w-full mt-1"
                        style={{ background: `linear-gradient(to right, ${adForm.bg_color_from}, ${adForm.bg_color_to})` }}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-600">Badge Penawaran <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border rounded-lg border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="Contoh: PENAWARAN SPESIAL"
                        value={adForm.badge}
                        onChange={(e) => setAdForm({ ...adForm, badge: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-600">Judul Promosi <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border rounded-lg border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="Contoh: Kredit Multiguna Usaha"
                        value={adForm.title}
                        onChange={(e) => setAdForm({ ...adForm, title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-600">Deskripsi Singkat</label>
                      <textarea
                        rows={2}
                        className="w-full px-3 py-2 border rounded-lg border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                        placeholder="Contoh: Bunga spesial mulai 0.5%/bulan, plafon cair dalam 1 hari!"
                        value={adForm.description}
                        onChange={(e) => setAdForm({ ...adForm, description: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-600">Teks Tombol CTA</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-lg border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="Contoh: Ajukan Sekarang"
                        value={adForm.cta}
                        onChange={(e) => setAdForm({ ...adForm, cta: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <input
                        type="checkbox"
                        id="ad_is_active"
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                        checked={adForm.is_active}
                        onChange={(e) => setAdForm({ ...adForm, is_active: e.target.checked })}
                      />
                      <label htmlFor="ad_is_active" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                        Langsung aktif di beranda user setelah diterbitkan
                      </label>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Megaphone size={14} />
                        Terbitkan Iklan
                      </button>
                      <button
                        type="button"
                        onClick={resetAdForm}
                        className="px-3 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-200 transition-all cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </form>
                </div>

                {/* Board Kelola Iklan */}
                <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Globe size={16} className="text-blue-500" />
                      Semua Iklan ({ads.length} Iklan)
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold">
                      <span className="flex items-center gap-1 text-emerald-600">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        {ads.filter(a => a.is_active).length} Aktif
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <span className="w-2 h-2 bg-slate-300 rounded-full"></span>
                        {ads.filter(a => !a.is_active).length} Nonaktif
                      </span>
                    </div>
                  </div>

                  {/* Search and Status Filters */}
                  {ads.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                      {/* Search Bar */}
                      <div className="relative w-full sm:w-60">
                        <Search className="absolute left-3 top-2.5 text-slate-400 w-3.5 h-3.5" />
                        <input
                          type="text"
                          placeholder="Cari judul/badge/deskripsi..."
                          value={adSearchQuery}
                          onChange={(e) => setAdSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 border rounded-lg border-slate-200 text-[11px] font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white placeholder-slate-400"
                        />
                        {adSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setAdSearchQuery('')}
                            className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                      
                      {/* Status Tabs */}
                      <div className="flex bg-slate-200/50 p-0.5 rounded-lg border border-slate-200 w-full sm:w-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => setAdStatusFilter('all')}
                          className={`flex-1 sm:flex-initial px-3 py-1 text-[10px] font-extrabold rounded-md transition-all cursor-pointer ${
                            adStatusFilter === 'all'
                              ? 'bg-white text-slate-800 shadow-sm border border-slate-200/20'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Semua ({ads.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdStatusFilter('active')}
                          className={`flex-1 sm:flex-initial px-3 py-1 text-[10px] font-extrabold rounded-md transition-all cursor-pointer ${
                            adStatusFilter === 'active'
                              ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/20'
                              : 'text-slate-500 hover:text-emerald-600'
                          }`}
                        >
                          Aktif ({ads.filter(a => a.is_active).length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdStatusFilter('inactive')}
                          className={`flex-1 sm:flex-initial px-3 py-1 text-[10px] font-extrabold rounded-md transition-all cursor-pointer ${
                            adStatusFilter === 'inactive'
                              ? 'bg-white text-slate-700 shadow-sm border border-slate-200/20'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          Nonaktif ({ads.filter(a => !a.is_active).length})
                        </button>
                      </div>
                    </div>
                  )}

                  {ads.length === 0 ? (
                    <div className="py-12 text-center flex flex-col items-center justify-center opacity-60">
                      <Megaphone size={40} className="text-slate-300 mb-2" />
                      <p className="text-sm font-bold text-slate-500">Belum ada iklan</p>
                      <p className="text-xs text-slate-400">Gunakan form di sebelah kiri untuk memasang iklan baru.</p>
                    </div>
                  ) : filteredAds.length === 0 ? (
                    <div className="py-12 text-center flex flex-col items-center justify-center opacity-60 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                      <Search size={36} className="text-slate-300 mb-2" />
                      <p className="text-xs font-bold text-slate-600">Pencarian tidak ditemukan</p>
                      <p className="text-[10px] text-slate-400">Tidak ada iklan yang cocok dengan filter atau kata kunci Anda.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredAds.map((ad) => (
                        <div
                          key={ad.id}
                          className={`rounded-xl border transition-all flex flex-col justify-between overflow-hidden ${
                            ad.is_active
                              ? 'border-emerald-200 bg-emerald-50/30 hover:shadow-md'
                              : 'border-slate-200/60 bg-slate-50/50 opacity-70 hover:opacity-90'
                          }`}
                        >
                          {/* Thumbnail */}
                          {ad.image_url && (
                            <div className="relative h-28 overflow-hidden bg-slate-100">
                              <img
                                src={ad.image_url}
                                alt={ad.title}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.parentNode.style.display = 'none'; }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                              <span className={`absolute top-2 right-2 text-[9px] font-black px-2 py-0.5 rounded-full ${
                                ad.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                              }`}>
                                {ad.is_active ? '● Aktif' : '● Nonaktif'}
                              </span>
                            </div>
                          )}

                          <div className="p-3 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[8px] font-black uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                                {ad.badge || 'PROMO'}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400">ID: #{ad.id}</span>
                            </div>
                            <h4 className="text-xs font-black text-slate-800 leading-snug">{ad.title}</h4>
                            {ad.description && (
                              <p className="text-[10px] text-slate-500 line-clamp-2">{ad.description}</p>
                            )}
                            <p className="text-[10px] text-slate-500 font-semibold">CTA: <span className="text-blue-600 font-extrabold">{ad.cta || 'Pelajari'}</span></p>
                          </div>

                          <div className="border-t border-slate-100 px-3 py-2 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleAdStatus(ad)}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                                ad.is_active
                                  ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              {ad.is_active ? <X size={11} /> : <Check size={11} />}
                              <span>{ad.is_active ? 'Nonaktifkan' : 'Aktifkan'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAd(ad.id)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 size={11} />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Kelola & Review Artikel Edukasi (Section Terpisah) */}
              <section ref={articleSectionRef} className="bg-slate-50/50 rounded-2xl border border-slate-200 p-6 space-y-6">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="text-amber-500 w-5 h-5 animate-pulse" />
                      Kelola &amp; Review Artikel Edukasi
                    </h2>
                    <p className="text-xs text-slate-500">Tulis artikel edukasi keuangan untuk nasabah, tinjau, dan terbitkan sekali klik.</p>
                  </div>
                  {editingArticleId && (
                    <button
                      onClick={cancelArticleEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all cursor-pointer"
                    >
                      <X size={14} /> Batal Edit (Kembali Tambah)
                    </button>
                  )}
                </div>

                {/* Form + Live Preview Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Side: Form Editor */}
                  <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <FileText size={16} className="text-blue-500" />
                      {editingArticleId ? 'Edit Konten Artikel' : 'Tulis Artikel Baru'}
                    </h3>
                    
                    <form onSubmit={createOrUpdateArticle} className="space-y-4">
                      
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-600">Judul Artikel</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          placeholder="Masukkan judul artikel..."
                          value={articleForm.title}
                          onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-600">Ringkasan Singkat (Excerpt)</label>
                        <textarea
                          rows={3}
                          className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          placeholder="Tulis ringkasan singkat artikel..."
                          value={articleForm.excerpt}
                          onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-600">Urutan Tampil (Sort Order)</label>
                          <input
                            type="number"
                            min="0"
                            className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={articleForm.sort_order}
                            onChange={(e) => setArticleForm({ ...articleForm, sort_order: Number(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-1 flex flex-col justify-end">
                          <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-lg h-[34px]">
                            <input
                              type="checkbox"
                              id="is_active_checkbox"
                              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                              checked={articleForm.is_active === 1}
                              onChange={(e) => setArticleForm({ ...articleForm, is_active: e.target.checked ? 1 : 0 })}
                            />
                            <label htmlFor="is_active_checkbox" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                              Langsung Diterbitkan?
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-600">Gambar Cover Artikel</label>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="relative border border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50 rounded-xl p-4 transition-all flex flex-col items-center justify-center text-center cursor-pointer">
                              <input
                                type="file"
                                ref={articleFileInputRef}
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleArticleImageChange}
                              />
                              <Upload className="text-slate-400 mb-1 w-5 h-5" />
                              <p className="text-xs font-bold text-slate-700">Pilih Berkas Gambar</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">JPG, JPEG, PNG (maksimal 5MB)</p>
                            </div>
                          </div>
                          {articlePreviewUrl && (
                            <div className="w-16 h-16 rounded-lg border border-slate-200 overflow-hidden shrink-0 relative bg-slate-100 flex items-center justify-center shadow-sm">
                              <img src={articlePreviewUrl} alt="Cover preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  setArticleImageFile(null);
                                  setArticlePreviewUrl(null);
                                  if (articleFileInputRef.current) articleFileInputRef.current.value = '';
                                }}
                                className="absolute top-0.5 right-0.5 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow"
                              >
                                <X size={8} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={savingArticle}
                          className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {savingArticle ? (
                            <><Loader2 size={14} className="animate-spin" /> Menyimpan...</>
                          ) : editingArticleId ? (
                            <><Check size={14} /> Simpan Perubahan</>
                          ) : (
                            <><Plus size={14} /> Simpan ke Draft / Review</>
                          )}
                        </button>
                        {editingArticleId && (
                          <button
                            type="button"
                            onClick={cancelArticleEdit}
                            className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-200 transition-all cursor-pointer"
                          >
                            Batal
                          </button>
                        )}
                      </div>

                    </form>
                  </div>

                  {/* Right Side: Live Preview Card */}
                  <div className="lg:col-span-5 flex flex-col justify-start">
                    <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 h-full flex flex-col">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-3 block">Pratinjau Instan (Real-time Live Preview)</span>
                      
                      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                        <div className="h-40 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                          {articlePreviewUrl ? (
                            <img src={articlePreviewUrl} alt="Article cover preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-slate-400">
                              <ImageIcon size={32} strokeWidth={1.5} />
                              <span className="text-[10px] font-semibold mt-1">Belum ada gambar cover</span>
                            </div>
                          )}
                          <div className="absolute top-2 left-2">
                            <span className={`text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${articleForm.is_active === 1 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                              {articleForm.is_active === 1 ? '● Terbit' : '● Draft'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <span className="text-[8px] font-extrabold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100/50 w-max block">Tips &amp; Edukasi</span>
                            <h4 className="text-xs font-black text-slate-800 leading-snug line-clamp-2">
                              {articleForm.title || 'Judul artikel Anda...'}
                            </h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-3">
                              {articleForm.excerpt || 'Ringkasan singkat artikel Anda akan muncul di sini...'}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4 text-[9px] text-slate-400 font-semibold">
                            <span>Baca Selengkapnya ▸</span>
                            <span>1 Menit Baca</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

                {/* Article Review Board List */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Globe size={16} className="text-blue-500" />
                        Board Review Artikel ({articles.length} Artikel)
                      </h3>
                      <p className="text-[11px] text-slate-400">Review visual tampilan kartu artikel pada dashboard nasabah atau lakukan aksi cepat.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="flex items-center gap-1 font-semibold text-slate-600 bg-slate-50 px-2 rounded-md border border-slate-200">
                        Total: <strong className="text-slate-800">{articles.length}</strong>
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 rounded-md border border-amber-100">
                        Draft: <strong className="text-amber-800">{articles.filter(a => !a.is_active).length}</strong>
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 rounded-md border border-emerald-100">
                        Terbit: <strong className="text-emerald-800">{articles.filter(a => a.is_active).length}</strong>
                      </span>
                    </div>
                  </div>

                  {articles.length === 0 ? (
                    <div className="py-12 text-center flex flex-col items-center justify-center opacity-60">
                      <FileText size={48} className="text-slate-300 mb-2" />
                      <p className="text-sm font-bold text-slate-500">Belum ada artikel edukasi</p>
                      <p className="text-xs text-slate-400">Tulis artikel pertama Anda melalui form editor di atas.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {articles.map((article) => (
                        <div key={article.id} className="group bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all duration-300">
                          
                          {/* Card Image */}
                          <div className="h-36 bg-slate-100 relative overflow-hidden flex items-center justify-center shrink-0">
                            {article.image_url ? (
                              <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <ImageIcon size={32} className="text-slate-300" />
                            )}
                            
                            <div className="absolute top-2 left-2">
                              <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${article.is_active ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-amber-500 text-white border-amber-600'}`}>
                                {article.is_active ? 'Terbit' : 'Draft / Review'}
                              </span>
                            </div>

                            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[8px] font-black text-white uppercase tracking-wider">
                              Urutan: {article.sort_order ?? 0}
                            </div>
                          </div>

                          {/* Card Content Info */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div className="space-y-1">
                              <span className="text-[8px] font-extrabold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100/50 w-max block">Tips &amp; Edukasi</span>
                              <h4 className="text-xs font-bold text-slate-800 leading-snug line-clamp-2 min-h-[32px] group-hover:text-blue-600 transition-colors">
                                {article.title}
                              </h4>
                              <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-3">
                                {article.excerpt}
                              </p>
                            </div>

                            {/* Actions Buttons Grid */}
                            <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-1.5">
                              
                              {/* Review Mockup Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setReviewingArticle(article);
                                  setIsReviewModalOpen(true);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all shrink-0 cursor-pointer"
                                title="Review tampilan visual di User Dashboard"
                              >
                                <Eye size={11} />
                                <span>Review</span>
                              </button>

                              {/* Status Toggle Switch */}
                              <button
                                type="button"
                                onClick={() => toggleArticleStatus(article)}
                                className={`flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-bold border rounded-lg transition-all cursor-pointer ${
                                  article.is_active
                                    ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                                    : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                }`}
                                title={article.is_active ? 'Tarik kembali ke Draft' : 'Terbitkan artikel agar bisa dibaca User'}
                              >
                                <Globe size={11} />
                                <span>{article.is_active ? 'Tarik' : 'Terbitkan'}</span>
                              </button>

                              <div className="flex items-center gap-1 shrink-0">
                                {/* Edit Button */}
                                <button
                                  type="button"
                                  onClick={() => startEditArticle(article)}
                                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-100 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Artikel"
                                >
                                  <Edit2 size={11} />
                                </button>

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteArticle(article)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-100 rounded-lg transition-colors cursor-pointer"
                                  title="Hapus Artikel"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>

                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </section>

            </div>
          )}

          {/* 🏦 TAB 2: KARTU BANK & KATEGORI ── */}
          {activeTab === 'banks-categories' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Master Kategori Bank Section */}
              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                  <Tags size={16} className="text-blue-500" />
                  Master Kategori Bank Dinamis
                </h3>
                
                <form onSubmit={createCategory} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                  <input
                    className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Nama Kategori (Contoh: terdaftar)"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  />
                  <input
                    className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    type="number"
                    placeholder="Urutan Tampil (Sort Order)"
                    value={categoryForm.sort_order || ''}
                    onChange={(e) => setCategoryForm({ ...categoryForm, sort_order: Number(e.target.value) })}
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} /> Tambah Kategori
                  </button>
                </form>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <th className="px-4 py-3 text-left font-extrabold uppercase">Nama Kategori</th>
                        <th className="px-4 py-3 text-left font-extrabold uppercase">Urutan</th>
                        <th className="px-4 py-3 text-right font-extrabold uppercase">Aksi Kelola</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderedCategories.map((cat, index) => (
                        <tr key={cat.id} className="border-b hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {editingCategoryId === cat.id ? (
                              <input
                                className="px-2 py-1 border rounded border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 w-full max-w-sm"
                                value={editingCategoryName}
                                onChange={(e) => setEditingCategoryName(e.target.value)}
                              />
                            ) : (
                              cat.name
                            )}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-500">{cat.sort_order}</td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <button
                              type="button"
                              className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-[10px] font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer text-slate-700"
                              disabled={index === 0}
                              onClick={() => moveCategoryPosition(cat.id, 'up')}
                            >
                              Naik
                            </button>
                            <button
                              type="button"
                              className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-[10px] font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer text-slate-700"
                              disabled={index === orderedCategories.length - 1}
                              onClick={() => moveCategoryPosition(cat.id, 'down')}
                            >
                              Turun
                            </button>
                            
                            {editingCategoryId === cat.id ? (
                              <button
                                type="button"
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                                onClick={() => saveCategoryEdit(cat.id)}
                              >
                                Simpan
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                                onClick={() => {
                                  setEditingCategoryId(cat.id);
                                  setEditingCategoryName(cat.name);
                                }}
                              >
                                Edit
                              </button>
                            )}

                            <button
                              type="button"
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold border border-red-200/50 rounded-lg transition-colors cursor-pointer"
                              onClick={async () => {
                                try {
                                  await deleteAdminBankCategory(cat.id);
                                  toast.success('Kategori berhasil dihapus.');
                                  loadAll();
                                } catch (error) {
                                  toast.error(error?.response?.data?.message || 'Hapus kategori gagal.');
                                }
                              }}
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Tambah Kartu Bank Section */}
              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
                  <CreditCard size={16} className="text-blue-500" />
                  Tambah Kartu Bank Finansial Baru
                </h3>
                <p className="text-[11px] text-slate-400 mb-5">
                  Isi informasi lengkap di bawah ini untuk menambahkan opsi pencarian bank rekomendasi nasabah.
                </p>
                
                <form onSubmit={createBank} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Nama Bank Mitra</label>
                    <input className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Contoh: Bank BRI" value={bankForm.nama_bank} onChange={(e) => setBankForm({ ...bankForm, nama_bank: e.target.value })} />
                  </div>
                  <div className="md:col-span-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 shadow-inner">
                    <label className="block text-[10px] font-black uppercase text-slate-600 mb-2 tracking-wider flex items-center gap-1.5">
                      <Tags size={14} className="text-blue-500" />
                      Pilih Kategori Bank (Bisa Pilih Lebih Dari Satu)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => {
                        const isSelected = bankForm.category_ids?.includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              const alreadySelected = bankForm.category_ids?.includes(cat.id);
                              let newIds = [];
                              if (alreadySelected) {
                                newIds = bankForm.category_ids.filter((id) => id !== cat.id);
                              } else {
                                newIds = [...(bankForm.category_ids || []), cat.id];
                              }
                              setBankForm({ ...bankForm, category_ids: newIds });
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 select-none cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] ${
                              isSelected
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-md shadow-blue-200'
                                : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {isSelected ? <Check size={12} strokeWidth={3} className="text-white" /> : <Plus size={12} strokeWidth={2.5} className="text-slate-400" />}
                            <span className="capitalize">{cat.name}</span>
                          </button>
                        );
                      })}
                    </div>
                    {(!bankForm.category_ids || bankForm.category_ids.length === 0) && (
                      <p className="text-[10px] text-red-500 font-semibold mt-1">⚠️ Wajib memilih minimal satu kategori</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Nama Produk Kredit</label>
                    <input className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Contoh: KUR Mikro Usaha" value={bankForm.nama_produk} onChange={(e) => setBankForm({ ...bankForm, nama_produk: e.target.value })} />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Suku Bunga (Teks Ringkasan)</label>
                    <input className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Contoh: 6% per tahun" value={bankForm.bunga} onChange={(e) => setBankForm({ ...bankForm, bunga: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Simulasi Cicilan (Teks Ringkasan)</label>
                    <input className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Contoh: Rp 1.750.000/bulan" value={bankForm.cicilan} onChange={(e) => setBankForm({ ...bankForm, cicilan: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Skor Kecocokan Awal (0-100)</label>
                    <input className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" type="number" min="0" max="100" value={bankForm.skor_kecocokan} onChange={(e) => setBankForm({ ...bankForm, skor_kecocokan: Number(e.target.value) })} />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Minimum Skor Kredit (0-600)</label>
                    <input className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" type="number" min="0" max="600" value={bankForm.min_score} onChange={(e) => setBankForm({ ...bankForm, min_score: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Plafon Cair Minimum (Rp)</label>
                    <input className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" type="number" min="0" value={bankForm.plafon_min} onChange={(e) => setBankForm({ ...bankForm, plafon_min: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Plafon Cair Maksimum (Rp)</label>
                    <input className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" type="number" min="0" value={bankForm.plafon_max} onChange={(e) => setBankForm({ ...bankForm, plafon_max: Number(e.target.value) })} />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Tenor Kredit Minimum (Bulan)</label>
                    <input className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" type="number" min="1" value={bankForm.tenor_min} onChange={(e) => setBankForm({ ...bankForm, tenor_min: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Tenor Kredit Maksimum (Bulan)</label>
                    <input className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" type="number" min="1" value={bankForm.tenor_max} onChange={(e) => setBankForm({ ...bankForm, tenor_max: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Bunga Riil Persen / Bulan</label>
                    <input className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" type="number" step="0.01" min="0" max="100" value={bankForm.bunga_persen} onChange={(e) => setBankForm({ ...bankForm, bunga_persen: Number(e.target.value) })} />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Deskripsi &amp; Ringkasan Produk</label>
                    <textarea className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" rows={2} placeholder="Tuliskan deskripsi produk pinjaman perbankan di sini..." value={bankForm.deskripsi} onChange={(e) => setBankForm({ ...bankForm, deskripsi: e.target.value })} />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Syarat &amp; Ketentuan Pengajuan (1 baris = 1 syarat)</label>
                    <textarea className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-[11px]" rows={3} placeholder={"Usaha aktif berjalan minimal 6 bulan\nMemiliki KTP & NIB\nTidak terdaftar dalam catatan kredit macet"} value={bankForm.syarat} onChange={(e) => setBankForm({ ...bankForm, syarat: e.target.value })} />
                  </div>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-xs font-bold shadow-md shadow-blue-200 transition-all hover:scale-[1.01] active:scale-[0.99] md:col-span-1 flex items-center justify-center gap-1 cursor-pointer">
                    <Plus size={14} /> Tambah Kartu Bank
                  </button>
                </form>
              </section>

              {/* Daftar Kartu Bank Section */}
              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-x-auto">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                  <Globe size={16} className="text-blue-500" />
                  Daftar Kartu Bank Terdaftar ({banks.length} Mitra)
                </h3>
                
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <th className="px-4 py-3 text-left font-extrabold uppercase">Kategori</th>
                      <th className="px-4 py-3 text-left font-extrabold uppercase">Nama Bank Mitra</th>
                      <th className="px-4 py-3 text-left font-extrabold uppercase">Nama Produk</th>
                      <th className="px-4 py-3 text-left font-extrabold uppercase">Pindah Kategori</th>
                      <th className="px-4 py-3 text-right font-extrabold uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banks.map((row) => (
                      <tr key={row.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-600">
                          <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                            {row.categories && row.categories.length > 0 ? (
                              row.categories.map((cat) => (
                                <span
                                  key={cat.id}
                                  className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-750 font-extrabold rounded-full border border-blue-100 text-[9px] uppercase tracking-wider shadow-sm"
                                >
                                  {cat.name}
                                </span>
                              ))
                            ) : (
                              <span className="px-2.5 py-1 bg-slate-50 text-slate-500 font-extrabold rounded-full border border-slate-200 text-[9px] uppercase tracking-wider shadow-sm">
                                {row.category_name || 'terdaftar'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-extrabold">
                          <button
                            type="button"
                            className="text-left text-blue-700 hover:text-blue-900 hover:underline font-bold transition-colors cursor-pointer"
                            onClick={() => openBankDetail(row)}
                          >
                            {row.nama_bank}
                          </button>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{row.nama_produk}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 items-center">
                            <select
                              className="px-2 py-1.5 border rounded-lg border-slate-200 text-[11px] bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-full max-w-[140px]"
                              value={rowCategoryMap[row.id] || ''}
                              onChange={(e) => setRowCategoryMap((prev) => ({ ...prev, [row.id]: e.target.value }))}
                            >
                              <option value="">Pilih</option>
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 hover:border-slate-300 border border-slate-200/80 text-[10px] font-bold rounded-lg transition-all cursor-pointer text-slate-700"
                              onClick={() => moveBankCategory(row.id)}
                            >
                              Pindahkan
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            type="button"
                            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-[10px] font-bold rounded-lg transition-all cursor-pointer text-slate-700"
                            onClick={() => openBankDetail(row)}
                          >
                            Detail / Edit
                          </button>
                          <button
                            type="button"
                            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold border border-red-200/50 rounded-lg transition-colors cursor-pointer"
                            onClick={async () => {
                              const check = window.confirm(`Apakah Anda yakin ingin menghapus kartu bank "${row.nama_bank}"?`);
                              if (!check) return;
                              try {
                                await deleteAdminBank(row.id);
                                toast.success('Kartu bank berhasil dihapus.');
                                loadAll();
                              } catch {
                                toast.error('Hapus kartu bank gagal.');
                              }
                            }}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

            </div>
          )}

          {/* 📁 TAB 3: BERKAS USER & KEAMANAN ── */}
          {activeTab === 'user-documents' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Data Berkas User Section */}
              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-x-auto">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                  <FolderOpen size={16} className="text-blue-500" />
                  Audit Berkas Legalitas &amp; Dokumen User
                </h3>
                
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <th className="px-4 py-3 text-left font-extrabold uppercase">Nama User</th>
                      <th className="px-4 py-3 text-left font-extrabold uppercase">Email Terdaftar</th>
                      <th className="px-4 py-3 text-left font-extrabold uppercase">Daftar Dokumen Unggahan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-slate-50 transition-colors align-top">
                        <td className="px-4 py-3.5 font-bold text-slate-800">{u.name}</td>
                        <td className="px-4 py-3.5 font-semibold text-slate-500">{u.email}</td>
                        <td className="px-4 py-3.5 space-y-1.5">
                          {(u.documents || []).length === 0 ? (
                            <span className="text-slate-400 italic">Belum ada dokumen yang diunggah</span>
                          ) : (
                            (u.documents || []).map((d, idx) => (
                              <a
                                key={`${u.id}-${idx}`}
                                href={d.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 text-blue-700 font-bold rounded-lg transition-colors text-[10px] mr-2 mb-2"
                              >
                                <FileText size={10} />
                                <span>{d.type.toUpperCase().replace('_PATH', '').replace('_UPLOAD', '')} ({d.extension ? d.extension.toUpperCase() : '-'})</span>
                              </a>
                            ))
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              {/* Ubah Password Admin Section */}
              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                  <Lock size={16} className="text-blue-500" />
                  Keamanan &amp; Perubahan Password Admin
                </h3>
                
                <form onSubmit={handleChangeAdminPassword} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Password Saat Ini</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="Masukkan password saat ini"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, current_password: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Password Baru</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="Masukkan password baru"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, new_password: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Konfirmasi Password Baru</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="Ulangi password baru"
                      value={passwordForm.new_password_confirmation}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, new_password_confirmation: e.target.value }))}
                    />
                  </div>
                  
                  <div className="md:col-span-3 pt-2">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-xs font-bold shadow-md shadow-blue-100 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check size={14} /> Simpan Sandi Baru
                    </button>
                  </div>
                </form>
              </section>

            </div>
          )}

        </div>
      </main>

      {/* ─── MODAL REVIEW / PREVIEW MOCKUP GLASSMORPHIC (TAB 1) ─── */}
      {isReviewModalOpen && reviewingArticle && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsReviewModalOpen(false)} />
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in scale-in duration-200 max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm leading-tight">Review Tampilan Artikel</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Mockup User Dashboard</p>
                </div>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 bg-slate-50/50 overflow-y-auto flex flex-col items-center">
              <p className="text-[10px] text-slate-400 font-bold mb-4 uppercase tracking-wider text-center">Tampilan Di Dashboard Nasabah (Tips &amp; Edukasi):</p>
              
              <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200/60 shadow-md overflow-hidden flex flex-col">
                <div className="h-44 overflow-hidden relative bg-slate-100 flex items-center justify-center">
                  {reviewingArticle.image_url ? (
                    <img src={reviewingArticle.image_url} alt={reviewingArticle.title} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={36} className="text-slate-300" />
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="text-[9px] font-black uppercase tracking-wider bg-blue-600 text-white px-2.5 py-1 rounded-full shadow-sm">
                      Tips &amp; Edukasi
                    </span>
                  </div>
                </div>
                
                <div className="p-4 bg-white">
                  <h4 className="text-sm font-extrabold text-slate-900 mb-1 leading-snug">
                    {reviewingArticle.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {reviewingArticle.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4 text-[10px] text-slate-400 font-bold">
                    <span>Baca Selengkapnya ▸</span>
                    <span>1 Menit Baca</span>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div className="w-full max-w-sm mt-5 bg-white border border-slate-200 rounded-xl p-3.5 flex items-start gap-2.5 shadow-sm">
                {reviewingArticle.is_active ? (
                  <>
                    <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                    <div className="text-left text-[11px]">
                      <p className="font-bold text-slate-800">Status: Diterbitkan (Published)</p>
                      <p className="text-slate-500">Artikel ini sudah **aktif** dan dapat dibaca oleh seluruh nasabah di User Dashboard mereka.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                    <div className="text-left text-[11px]">
                      <p className="font-bold text-slate-800">Status: Draft / Review</p>
                      <p className="text-slate-500">Artikel ini masih bersifat **rahasia** dan tidak akan muncul di dashboard nasabah sampai Anda menerbitkannya.</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white shrink-0">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleArticleStatus(reviewingArticle);
                  setIsReviewModalOpen(false);
                }}
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-1.5 ${
                  reviewingArticle.is_active
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                }`}
              >
                <Globe size={14} />
                <span>{reviewingArticle.is_active ? 'Tarik Kembali (Draft)' : 'Terbitkan Sekarang'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ─── MODAL DETAIL & EDIT KARTU BANK POPUP (TAB 2) ─── */}
      {bankDetailOpen && bankDetailForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !savingBankDetail && setBankDetailOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            
            <h3 className="text-lg font-black text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
              <CreditCard size={18} className="text-blue-600" />
              Detail &amp; Edit Kartu Bank Rekomendasi
            </h3>
            
            <form onSubmit={saveBankDetail} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Nama Bank</label>
                <input className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" value={bankDetailForm.nama_bank} onChange={(e) => setBankDetailForm((prev) => ({ ...prev, nama_bank: e.target.value }))} />
              </div>
              <div className="md:col-span-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 shadow-inner">
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-2 tracking-wider flex items-center gap-1.5">
                  <Tags size={14} className="text-blue-500" />
                  Kategori Bank Mitra (Bisa Pilih Lebih Dari Satu)
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const isSelected = bankDetailForm.category_ids?.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          const alreadySelected = bankDetailForm.category_ids?.includes(cat.id);
                          let newIds = [];
                          if (alreadySelected) {
                            newIds = bankDetailForm.category_ids.filter((id) => id !== cat.id);
                          } else {
                            newIds = [...(bankDetailForm.category_ids || []), cat.id];
                          }
                          setBankDetailForm({ ...bankDetailForm, category_ids: newIds });
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 select-none cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-md shadow-blue-200'
                            : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {isSelected ? <Check size={12} strokeWidth={3} className="text-white" /> : <Plus size={12} strokeWidth={2.5} className="text-slate-400" />}
                        <span className="capitalize">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
                {(!bankDetailForm.category_ids || bankDetailForm.category_ids.length === 0) && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1">⚠️ Wajib memilih minimal satu kategori</p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Nama Produk Kredit</label>
                <input className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" value={bankDetailForm.nama_produk} onChange={(e) => setBankDetailForm((prev) => ({ ...prev, nama_produk: e.target.value }))} />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Suku Bunga</label>
                <input className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" value={bankDetailForm.bunga} onChange={(e) => setBankDetailForm((prev) => ({ ...prev, bunga: e.target.value }))} />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Simulasi Cicilan</label>
                <input className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" value={bankDetailForm.cicilan} onChange={(e) => setBankDetailForm((prev) => ({ ...prev, cicilan: e.target.value }))} />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Skor Kecocokan (0-100)</label>
                <input className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" type="number" value={bankDetailForm.skor_kecocokan} onChange={(e) => setBankDetailForm((prev) => ({ ...prev, skor_kecocokan: e.target.value }))} />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Minimum Skor Kredit (0-600)</label>
                <input className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" type="number" value={bankDetailForm.min_score} onChange={(e) => setBankDetailForm((prev) => ({ ...prev, min_score: e.target.value }))} />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Plafon Cair Minimum (Rp)</label>
                <input className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" type="number" value={bankDetailForm.plafon_min} onChange={(e) => setBankDetailForm((prev) => ({ ...prev, plafon_min: e.target.value }))} />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Plafon Cair Maksimum (Rp)</label>
                <input className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" type="number" value={bankDetailForm.plafon_max} onChange={(e) => setBankDetailForm((prev) => ({ ...prev, plafon_max: e.target.value }))} />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Tenor Kredit Minimum (Bulan)</label>
                <input className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" type="number" value={bankDetailForm.tenor_min} onChange={(e) => setBankDetailForm((prev) => ({ ...prev, tenor_min: e.target.value }))} />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Tenor Kredit Maksimum (Bulan)</label>
                <input className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" type="number" value={bankDetailForm.tenor_max} onChange={(e) => setBankDetailForm((prev) => ({ ...prev, tenor_max: e.target.value }))} />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Bunga Riil Persen / Bulan</label>
                <input className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" type="number" step="0.01" value={bankDetailForm.bunga_persen} onChange={(e) => setBankDetailForm((prev) => ({ ...prev, bunga_persen: e.target.value }))} />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Deskripsi &amp; Ringkasan Produk</label>
                <textarea className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" rows={2} value={bankDetailForm.deskripsi} onChange={(e) => setBankDetailForm((prev) => ({ ...prev, deskripsi: e.target.value }))} />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Syarat &amp; Ketentuan (1 baris = 1 syarat)</label>
                <textarea className="w-full px-3 py-2 border rounded-lg border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-[11px]" rows={4} value={bankDetailForm.syarat} onChange={(e) => setBankDetailForm((prev) => ({ ...prev, syarat: e.target.value }))} />
              </div>
              
              <div className="md:col-span-3 flex gap-3 justify-end border-t border-slate-100 pt-4 mt-2">
                <button type="button" className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer" onClick={() => setBankDetailOpen(false)} disabled={savingBankDetail}>Batal</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-md shadow-blue-200 transition-all cursor-pointer" disabled={savingBankDetail}>{savingBankDetail ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
