import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  Modal,
  Platform,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar as RNCalendar } from 'react-native-calendars';
import * as Print from 'expo-print';
import { 
  PlusCircle, 
  ClipboardList, 
  Settings, 
  Save, 
  Trash2, 
  Edit2, 
  CheckSquare, 
  Square, 
  Search, 
  Printer, 
  Calendar,
  Globe,
  DollarSign,
  ChevronRight,
  X,
  Eye,
  EyeOff,
  User,
  ShieldAlert,
  Info,
  KeyRound,
  LogOut,
  Palette,
  Scale,
  MapPin
} from 'lucide-react-native';

// ==========================================
// ✅ FIREBASE CONFIGURATION
// ==========================================
const FIREBASE_API_KEY = "AIzaSyCMDh_gHop7VoQTOZT67tJwQDfLu60y4Co"; 
const FIREBASE_DB_URL = "https://studio-4185593087-ccf71-default-rtdb.firebaseio.com/"; 

// ==========================================
// ✅ PREMIUM THEMES DEFINITION (MAX 4 COMBINATIONS)
// ==========================================
const APP_THEMES = {
  royalOrchid: {
    id: 'royalOrchid',
    name: 'Royal Orchid',
    gradient: ['#E2D9F3', '#D8F3F7'],
    primary: '#3A2A9A',
    secondary: '#E11D74',
    cardBg: 'rgba(255, 255, 255, 0.75)',
    textMain: '#1E1B4B',
    textSub: '#666',
    isDark: false
  },
  emeraldMint: {
    id: 'emeraldMint',
    name: 'Emerald Mint',
    gradient: ['#D1FAE5', '#CFFAFE'],
    primary: '#065F46',
    secondary: '#059669',
    cardBg: 'rgba(255, 255, 255, 0.8)',
    textMain: '#064E3B',
    textSub: '#4B5563',
    isDark: false
  },
  rubyRose: {
    id: 'rubyRose',
    name: 'Ruby Rose',
    gradient: ['#FFE4E6', '#F3E8FF'],
    primary: '#9F1239',
    secondary: '#BE123C',
    cardBg: 'rgba(255, 255, 255, 0.78)',
    textMain: '#4C0519',
    textSub: '#4B5563',
    isDark: false
  },
  midnightOnyx: {
    id: 'midnightOnyx',
    name: 'Midnight Onyx (Dark)',
    gradient: ['#0F172A', '#1E293B'],
    primary: '#38BDF8',
    secondary: '#F43F5E',
    cardBg: '#1E293B',
    textMain: '#F8FAFC',
    textSub: '#94A3B8',
    isDark: true
  }
};

// ==========================================
// ✅ TRANSLATIONS
// ==========================================
const translations = {
  en: {
    appName: "E-Chakki", tagline: "Welcome",
    username: "Customer Name", weight: "Weight (KG)", address: "Delivery Address (Optional)",
    saveEntry: "Save Entry", newEntry: "New Entry", orders: "Orders", settings: "Settings",
    totalKg: "Total kg", revenue: "Revenue", searchPlaceholder: "Search by name or serial ID",
    edit: "Edit", delete: "Delete", mark: "Mark", logout: "Logout Account",
    pricingConfig: "Cost Per KG (₹)", langSelect: "Language / भाषा", login: "Login",
    createAccount: "Create Account", emailLabel: "Registered Email ID", passwordLabel: "Password"
  },
  hi: {
    appName: "E-Chakki", tagline: "स्वागत है",
    username: "ग्राहक का नाम", weight: "वजन (किग्रा)", address: "डिलिवरी का पता (वैकल्पिक)",
    saveEntry: "प्रविष्टि सुरक्षित करें", newEntry: "नई एंट्री", orders: "ऑर्डर", settings: "सेटिंग्स",
    totalKg: "कुल किग्रा", revenue: "कुल कमाई", searchPlaceholder: "नाम या सीरियल आईडी से खोजें",
    edit: "बदलें", delete: "हटाएं", mark: "मार्क", logout: "लॉगआउट अकाउंट",
    pricingConfig: "लागत प्रति किग्रा (₹)", langSelect: "भाषा / Language", login: "लॉगिन",
    createAccount: "खाता बनाएं", emailLabel: "पंजीकृत ईमेल आईडी", passwordLabel: "पासवर्ड"
  }
};

export default function App() {
  const getTodayDateString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const separator = dateStr.includes('-') ? '-' : '/';
    const [year, month, day] = dateStr.split(separator);
    
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    const monthName = months[parseInt(month, 10) - 1]; 
    return `${parseInt(day, 10)} ${monthName} ${year}`;
  };

  // Auth States
  const [userToken, setUserToken] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Theme & Layout States
  const [currentTheme, setCurrentTheme] = useState(APP_THEMES.royalOrchid);
  const [currentTab, setCurrentTab] = useState('orders');
  const [lang, setLang] = useState('en');
  
  // Modals & Popups
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [printModalVisible, setPrintModalVisible] = useState(false);
  const [statusPopupVisible, setStatusPopupVisible] = useState(false);
  const [statusPopupMsg, setStatusPopupMsg] = useState('');
  const [selectedOrderIdToDelete, setSelectedOrderIdToDelete] = useState(null);

  // Business States
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [costPerKg, setCostPerKg] = useState('2'); 
  const [customerName, setCustomerName] = useState('');
  const [weight, setWeight] = useState('');
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [orders, setOrders] = useState([]);

  const t = translations[lang];

  useEffect(() => {
    if (userToken) {
      fetchOrdersFromCloud();
      fetchSettingsFromCloud();
    }
  }, [currentTab, selectedDate, userToken]);

  const fetchOrdersFromCloud = async () => {
    try {
      const url = `${FIREBASE_DB_URL}orders.json`;
      const response = await fetch(url);
      const data = await response.json();
      if (data) {
        const fetched = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        
        fetched.sort((a, b) => a.serialId - b.serialId);
        setOrders(fetched);
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.log("Error fetching orders:", e);
    }
  };

  const fetchSettingsFromCloud = async () => {
    try {
      const url = `${FIREBASE_DB_URL}settings/global.json`;
      const response = await fetch(url);
      const data = await response.json();
      if (data) {
        if (data.costPerKg) setCostPerKg(data.costPerKg || '2');
        if (data.themeId && APP_THEMES[data.themeId]) {
          setCurrentTheme(APP_THEMES[data.themeId]);
        }
      }
    } catch (e) {
      console.log("Using local config");
    }
  };

  const updateGlobalCostInCloud = async (newCost) => {
    setCostPerKg(newCost);
    try {
      const url = `${FIREBASE_DB_URL}settings/global.json`;
      await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ costPerKg: newCost })
      });
    } catch (e) {
      console.log(e);
    }
  };

  const updateGlobalThemeInCloud = async (themeKey) => {
    const selectedTheme = APP_THEMES[themeKey];
    if (!selectedTheme) return;
    setCurrentTheme(selectedTheme);
    showStatusAlert(`Theme changed to ${selectedTheme.name}`);
    try {
      const url = `${FIREBASE_DB_URL}settings/global.json`;
      await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId: themeKey })
      });
    } catch (e) {
      console.log(e);
    }
  };

  const handleAuthAction = async () => {
    if (!authEmail || !authPassword) {
      alert("Please fill all Auth Credentials");
      return;
    }
    setLoading(true);
    const endpoint = isSignUp ? 'signUp' : 'signInWithPassword';
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:${endpoint}?key=${FIREBASE_API_KEY}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword, returnSecureToken: true })
      });
      const data = await response.json();
      if (data.error) {
        alert(data.error.message);
      } else {
        setUserToken(data.idToken);
        setUserEmail(data.email);
        setUserId(data.localId);
        showStatusAlert(isSignUp ? "Account Created! 🎉" : "Welcome Back! 🔐");
      }
    } catch (error) {
      alert("Network Error during auth");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const targetEmail = authEmail || userEmail;
    if (!targetEmail) {
      alert("Please enter your registered Email address first.");
      return;
    }
    setLoading(true);
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: "PASSWORD_RESET", email: targetEmail })
      });
      const data = await response.json();
      if (data.error) {
        alert(data.error.message);
      } else {
        alert(`Password Reset security link sent to: ${targetEmail}`);
      }
    } catch (error) {
      alert("Verification Server unreachable");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUserToken(null);
    setUserId(null);
    setUserEmail('');
    setOrders([]);
    setCurrentTab('orders');
  };

  const handleSaveEntry = async () => {
    if (!customerName.trim() || !weight.trim()) {
      alert("Please fill Customer Name and Weight");
      return;
    }

    setLoading(true);
    const calculatedCost = parseFloat(weight) * parseFloat(costPerKg);
    const today = new Date();
    const currentTime = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const payload = {
      userId: userId || "admin_user",
      name: customerName,
      address: address || 'Balakmau',
      weight: parseFloat(weight),
      cost: calculatedCost,
      time: currentTime,
      date: selectedDate,
      completed: editingId ? orders.find(o => o.id === editingId)?.completed || false : false
    };

    try {
      let url = "";
      let method = "POST";

      if (editingId) {
        url = `${FIREBASE_DB_URL}orders/${editingId}.json`;
        method = "PATCH";
        payload.serialId = orders.find(o => o.id === editingId)?.serialId || 1;
      } else {
        url = `${FIREBASE_DB_URL}orders.json`;
        method = "POST";
        
        const ordersForThisDate = orders.filter(o => o.date === selectedDate);
        const maxSerialForDate = ordersForThisDate.reduce((max, item) => (item.serialId > max ? item.serialId : max), 0);
        payload.serialId = maxSerialForDate + 1; 
        
        payload.completed = false;
      }

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server status ${response.status}.`);
      }

      showStatusAlert(editingId ? "Order updated!" : "Order created successfully!");
      
      setCustomerName('');
      setWeight('');
      setAddress('');
      setEditingId(null);
      setCurrentTab('orders');
      
      await fetchOrdersFromCloud();

    } catch (e) {
      alert("Save Failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setCustomerName(item.name);
    setWeight(item.weight.toString());
    setAddress(item.address);
    setCurrentTab('newEntry');
  };

  const triggerDeleteConfirm = (id) => {
    setSelectedOrderIdToDelete(id);
    setDeleteModalVisible(true);
  };

  const executeDelete = async () => {
    try {
      const url = `${FIREBASE_DB_URL}orders/${selectedOrderIdToDelete}.json`;
      await fetch(url, { method: 'DELETE' });
      setDeleteModalVisible(false);
      setSelectedOrderIdToDelete(null);
      showStatusAlert("Record deleted");
      fetchOrdersFromCloud();
    } catch (e) {
      console.log(e);
    }
  };

  const toggleComplete = async (id, currentStatus) => {
    try {
      const url = `${FIREBASE_DB_URL}orders/${id}.json`;
      await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus })
      });
      showStatusAlert(!currentStatus ? "Order COMPLETED ✅" : "Order PENDING ⏳");
      fetchOrdersFromCloud();
    } catch (e) {
      console.log(e);
    }
  };

  const showStatusAlert = (msg) => {
    setStatusPopupMsg(msg);
    setStatusPopupVisible(true);
    setTimeout(() => setStatusPopupVisible(false), 2000);
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.name?.toLowerCase().includes(searchQuery.toLowerCase()) || o.serialId?.toString() === searchQuery;
    const matchesDate = o.date === selectedDate;
    return matchesDate && matchesSearch;
  });

  const totalWeight = filteredOrders.reduce((acc, item) => acc + (item.weight || 0), 0).toFixed(1);
  const numericRevenue = filteredOrders.reduce((acc, item) => acc + (item.completed ? (item.cost || 0) : 0), 0);
  const totalRevenue = numericRevenue.toFixed(0);

  const executePrintAction = async (printFilterType) => {
    setPrintModalVisible(false);

    let itemsToPrint = [...filteredOrders];
    let subtitleType = "All Statements";

    if (printFilterType === 'completed') {
      itemsToPrint = filteredOrders.filter(o => o.completed);
      subtitleType = "Completed Orders Only";
    } else if (printFilterType === 'pending') {
      itemsToPrint = filteredOrders.filter(o => !o.completed);
      subtitleType = "Pending Orders Only";
    }

    if (itemsToPrint.length === 0) {
      alert("No data matched your selection to print.");
      return;
    }

    const printWeight = itemsToPrint.reduce((acc, item) => acc + (item.weight || 0), 0).toFixed(1);
    const printRevenue = itemsToPrint.reduce((acc, item) => acc + (item.completed ? (item.cost || 0) : 0), 0).toFixed(0);

    const tableRows = itemsToPrint.map((o, idx) => `
      <tr>
        <td>#${o.serialId || idx + 1}</td>
        <td>${o.name}</td>
        <td>${o.weight ? o.weight.toFixed(2) : '0.00'}</td>
        <td>₹${o.cost ? o.cost.toFixed(2) : '0.00'}</td>
        <td>${o.time || ''}</td>
        <td>${o.address || ''}</td>
        <td style="color: ${o.completed ? '#22C55E' : '#EF4444'}; font-weight: bold;">${o.completed ? 'Completed' : 'Pending'}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 25px; color: #1E1B4B; background-color: #FAFAFA; }
            .header-container { text-align: center; border-bottom: 3px double #3A2A9A; padding-bottom: 12px; margin-bottom: 20px; }
            h2 { color: #3A2A9A; text-transform: uppercase; margin: 0 0 5px 0; font-size: 24px; letter-spacing: 1px; }
            .date-badge { font-size: 14px; color: #555; font-weight: 500; }
            
            .stats-dashboard { display: flex; justify-content: space-between; margin-bottom: 25px; gap: 15px; }
            .stat-card { flex: 1; background: #FFF; border: 1px solid #E2D9F3; padding: 15px; border-radius: 12px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
            .stat-card h4 { margin: 0 0 6px 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            .stat-card p { margin: 0; font-size: 20px; font-weight: bold; color: #3A2A9A; }
            .stat-card .rev-val { color: #E11D74; }

            table { width: 100%; border-collapse: collapse; background: #FFF; border-radius: 8px; overflow: hidden; margin-top: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
            th, td { padding: 12px 10px; text-align: left; font-size: 13px; border-bottom: 1px solid #EEE; }
            th { background-color: #3A2A9A; color: #FFF; font-weight: 600; text-transform: uppercase; font-size: 11px; }
            tr:last-child td { border-bottom: none; }
            tr:nth-child(even) { background-color: #F8F7FD; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <h2>E-Chakki Statement (${subtitleType})</h2>
            <div class="date-badge">Statement Date: ${formatDisplayDate(selectedDate)}</div>
          </div>

          <div class="stats-dashboard">
            <div class="stat-card">
              <h4>Total Records</h4>
              <p>${itemsToPrint.length}</p>
            </div>
            <div class="stat-card">
              <h4>Processed Weight</h4>
              <p>${printWeight} kg</p>
            </div>
            <div class="stat-card">
              <h4>Collected Revenue</h4>
              <p class="rev-val">₹${printRevenue}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 8%">S.ID</th>
                <th>Customer Name</th>
                <th>Weight (kg)</th>
                <th>Cost</th>
                <th>Time</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `;

    try {
      if (Platform.OS === 'web') {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
      } else {
        await Print.printAsync({ html: htmlContent });
      }
    } catch (error) {
      alert("Error generating PDF: " + error.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: currentTheme.gradient[0] }]}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </View>
    );
  }

  // Auth View
  if (!userToken) {
    return (
      <LinearGradient colors={currentTheme.gradient} style={styles.container}>
        <View style={styles.authWrapper}>
          <View style={[styles.authBoxCard, currentTheme.isDark && { backgroundColor: '#1E293B', borderColor: '#334155', borderWidth: 1 }]}>
            <Text style={[styles.brandTitle, { marginBottom: 2, color: currentTheme.primary }]}>E-Chakki</Text>
            <Text style={[styles.authSubtitle, currentTheme.isDark && { color: '#94A3B8' }]}>{isSignUp ? t.createAccount : "Sign In to Your Account"}</Text>
            
            <View style={styles.fieldSection}>
              <Text style={[styles.inputLabel, { color: currentTheme.primary }]}>✉️ {t.emailLabel}</Text>
              <TextInput 
                style={[styles.formInput, currentTheme.isDark && { backgroundColor: '#334155', color: '#FFF', borderColor: '#475569' }]}
                placeholder="Enter email address"
                placeholderTextColor={currentTheme.isDark ? '#94A3B8' : '#999'}
                value={authEmail}
                autoCapitalize="none"
                onChangeText={setAuthEmail}
              />
            </View>

            <View style={styles.fieldSection}>
              <Text style={[styles.inputLabel, { color: currentTheme.primary }]}>🔑 {t.passwordLabel}</Text>
              <View style={[styles.passwordInputContainer, currentTheme.isDark && { backgroundColor: '#334155', borderColor: '#475569' }]}>
                <TextInput 
                  style={{ flex: 1, paddingVertical: 10, fontSize: 16, color: currentTheme.isDark ? '#FFF' : '#000' }}
                  placeholder="Enter Account Password"
                  placeholderTextColor={currentTheme.isDark ? '#94A3B8' : '#999'}
                  secureTextEntry={!showPassword}
                  value={authPassword}
                  autoCapitalize="none"
                  onChangeText={setAuthPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 6 }}>
                  {showPassword ? <EyeOff size={20} color={currentTheme.primary} /> : <Eye size={20} color={currentTheme.primary} />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={[styles.authPrimaryBtn, { backgroundColor: currentTheme.primary }]} onPress={handleAuthAction}>
              <Text style={styles.authBtnText}>{isSignUp ? t.createAccount : t.login}</Text>
            </TouchableOpacity>

            {!isSignUp && (
              <TouchableOpacity style={{ marginTop: 15, alignItems: 'center' }} onPress={handleForgotPassword}>
                <Text style={{ color: currentTheme.secondary, fontWeight: '600', fontSize: 14 }}>
                  Forgot Password? Get Reset Link 📬
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={{ marginTop: 25 }} onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={{ color: currentTheme.primary, fontWeight: '600', textAlign: 'center', fontSize: 14 }}>
                {isSignUp ? "Already have an account? Login Here" : "New Device User? Create Account"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={currentTheme.gradient} style={styles.container}>
      <StatusBar barStyle={currentTheme.isDark ? "light-content" : "dark-content"} />
      <SafeAreaView style={styles.responsiveSafeArea}>

        {/* STICKY VIEW */}
        {currentTab === 'orders' && (
          <View style={[styles.stickyHeaderWrapper, currentTheme.isDark && { backgroundColor: '#0F172A' }]}>
            <View style={styles.orderHeaderRow}>
              <Text style={[styles.dateText, { color: currentTheme.textMain }]}>{formatDisplayDate(selectedDate)}</Text>
              <View style={styles.iconActionContainer}>
                <TouchableOpacity style={styles.headerIconBtn} onPress={() => setCalendarModalVisible(true)}>
                  <Calendar size={22} color={currentTheme.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerIconBtn} onPress={() => setPrintModalVisible(true)}>
                  <Printer size={22} color={currentTheme.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.searchBarContainer, currentTheme.isDark && { backgroundColor: '#1E293B' }]}>
              <Search size={18} color={currentTheme.isDark ? "#94A3B8" : "#666"} style={{ marginRight: 8 }} />
              <TextInput 
                placeholder={t.searchPlaceholder}
                placeholderTextColor={currentTheme.isDark ? "#64748B" : "#888"}
                style={[styles.searchBar, { color: currentTheme.textMain }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={[styles.summaryContainer, currentTheme.isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
              <View style={styles.summaryCol}>
                <Text style={[styles.summaryVal, { color: currentTheme.textMain }]}>{filteredOrders.length}</Text>
                <Text style={[styles.summaryLabel, { color: currentTheme.textSub }]}>{t.orders}</Text>
              </View>
              <View style={[styles.dividerLine, { backgroundColor: currentTheme.isDark ? '#334155' : '#BBB' }]} />
              <View style={styles.summaryCol}>
                <Text style={[styles.summaryVal, { color: currentTheme.textMain }]}>{totalWeight}</Text>
                <Text style={[styles.summaryLabel, { color: currentTheme.textSub }]}>{t.totalKg}</Text>
              </View>
              <View style={[styles.dividerLine, { backgroundColor: currentTheme.isDark ? '#334155' : '#BBB' }]} />
              <View style={styles.summaryCol}>
                <Text style={[
                  styles.summaryVal, 
                  { color: numericRevenue > 0 ? '#22C55E' : currentTheme.textMain }
                ]}>
                  ₹{totalRevenue}
                </Text>
                <Text style={[styles.summaryLabel, { color: currentTheme.textSub }]}>{t.revenue}</Text>
              </View>
            </View>
          </View>
        )}

        {/* SCROLLABLE CONTAINER */}
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
        >

          {/* TAB 1: NEW ENTRY FORM */}
          {currentTab === 'newEntry' && (
            <View style={styles.tabContent}>
              <View style={styles.logoSpacing}>
                <Text style={styles.wheatLogo}>🌾</Text>
                <Text style={[styles.brandTitle, { color: currentTheme.primary }]}>{t.appName}</Text>
                <Text style={[styles.brandSub, { color: currentTheme.textSub }]}>{t.tagline}</Text>
              </View>

              <View style={[styles.formGroup, currentTheme.isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                
                <Text style={[styles.inputLabel, { color: currentTheme.primary }]}>{t.username}</Text>
                <View style={[styles.modernInputWrapper, currentTheme.isDark && { backgroundColor: '#334155', borderColor: '#475569' }]}>
                  <User size={20} color={currentTheme.isDark ? '#94A3B8' : currentTheme.primary} style={styles.inputPrefixIcon} />
                  <TextInput 
                    style={[styles.modernInput, currentTheme.isDark && { color: '#FFF' }]} 
                    placeholder="Enter Customer Name"
                    placeholderTextColor={currentTheme.isDark ? '#94A3B8' : '#999'}
                    value={customerName}
                    onChangeText={setCustomerName}
                  />
                </View>

                <Text style={[styles.inputLabel, { color: currentTheme.primary }]}>{t.weight}</Text>
                <View style={[styles.modernInputWrapper, currentTheme.isDark && { backgroundColor: '#334155', borderColor: '#475569' }]}>
                  <Scale size={20} color={currentTheme.isDark ? '#94A3B8' : currentTheme.primary} style={styles.inputPrefixIcon} />
                  <TextInput 
                    style={[styles.modernInput, currentTheme.isDark && { color: '#FFF' }]} 
                    placeholder="Enter Weight (in kg)"
                    placeholderTextColor={currentTheme.isDark ? '#94A3B8' : '#999'}
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                  />
                </View>

                <Text style={[styles.inputLabel, { color: currentTheme.primary }]}>{t.address}</Text>
                <View style={[styles.modernInputWrapper, currentTheme.isDark && { backgroundColor: '#334155', borderColor: '#475569' }, { alignItems: 'flex-start', paddingTop: 12 }]}>
                  <MapPin size={20} color={currentTheme.isDark ? '#94A3B8' : currentTheme.primary} style={[styles.inputPrefixIcon, { marginTop: 2 }]} />
                  <TextInput 
                    style={[styles.modernInput, currentTheme.isDark && { color: '#FFF' }, { height: 70, textAlignVertical: 'top' }]} 
                    placeholder="Enter Delivery Address"
                    placeholderTextColor={currentTheme.isDark ? '#94A3B8' : '#999'}
                    multiline
                    value={address}
                    onChangeText={setAddress}
                  />
                </View>

                <View style={styles.middleButtonWrapper}>
                  <TouchableOpacity style={[styles.saveButton, { backgroundColor: currentTheme.secondary }]} onPress={handleSaveEntry}>
                    <Save size={18} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.saveButtonText}>{t.saveEntry}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* TAB 2: SAVED ORDERS FEED */}
          {currentTab === 'orders' && (
            <View style={styles.tabContent}>
              {filteredOrders.length === 0 ? (
                <View style={[styles.emptyContainer, currentTheme.isDark && { backgroundColor: '#1E293B' }]}>
                  <ClipboardList size={40} color={currentTheme.primary} style={{ opacity: 0.6 }} />
                  <Text style={{ color: currentTheme.textMain, marginTop: 10, fontSize: 16, fontWeight: '600' }}>No entries for this date.</Text>
                  <TouchableOpacity style={[styles.reloadBtn, { backgroundColor: currentTheme.primary }]} onPress={fetchOrdersFromCloud}>
                     <Text style={{ color: '#FFF', fontSize: 12 }}>Tap to Reload Data 🔄</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                filteredOrders.map((item, index) => (
                  <View key={item.id} style={[
                    styles.orderCard, 
                    { backgroundColor: currentTheme.isDark ? '#1E293B' : 'rgba(255, 255, 255, 0.75)' },
                    item.completed && (currentTheme.isDark ? { backgroundColor: '#064E3B', opacity: 0.8 } : styles.completedCard)
                  ]}>
                    <View style={styles.cardTopRow}>
                      <View style={[styles.serialBadge, { backgroundColor: currentTheme.primary }]}>
                        <Text style={styles.serialText}>#{item.serialId || index + 1}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={[styles.cardCustomerName, { color: currentTheme.textMain }, item.completed && styles.strikethrough]}>{item.name}</Text>
                        <Text style={[styles.cardLocation, { color: currentTheme.textSub }]}>{item.address}</Text>
                      </View>
                      <Text style={[styles.cardTimestamp, { color: currentTheme.textSub }]}>{item.time}</Text>
                    </View>

                    <View style={styles.cardMiddleRow}>
                      <View style={[styles.infoBox, currentTheme.isDark && { backgroundColor: '#334155', borderColor: '#475569' }]}>
                        <Text style={[styles.boxLabel, { color: currentTheme.textSub }]}>WEIGHT</Text>
                        <Text style={[styles.boxVal, { color: currentTheme.textMain }]}>{item.weight ? item.weight.toFixed(2) : '0'} kg</Text>
                      </View>
                      <View style={[styles.infoBox, currentTheme.isDark && { backgroundColor: '#334155', borderColor: '#475569' }]}>
                        <Text style={[styles.boxLabel, { color: currentTheme.textSub }]}>COST</Text>
                        <Text style={[styles.boxVal, { color: currentTheme.textMain }]}>₹{item.cost ? item.cost.toFixed(2) : '0'}</Text>
                      </View>
                    </View>

                    <View style={[styles.cardActionRow, { borderTopColor: currentTheme.isDark ? '#334155' : '#EEE' }]}>
                      <TouchableOpacity style={styles.inlineActionBtn} onPress={() => handleEdit(item)}>
                        <Edit2 size={16} color={currentTheme.isDark ? "#94A3B8" : "#64748B"} />
                        <Text style={[styles.inlineBtnText, { color: currentTheme.isDark ? "#94A3B8" : "#64748B" }]}>{t.edit}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.inlineActionBtn} onPress={() => triggerDeleteConfirm(item.id)}>
                        <Trash2 size={16} color="#EF4444" />
                        <Text style={[styles.inlineBtnText, { color: '#EF4444' }]}>{t.delete}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.inlineActionBtn} onPress={() => toggleComplete(item.id, item.completed)}>
                        {item.completed ? <CheckSquare size={16} color="#22C55E" /> : <Square size={16} color={currentTheme.isDark ? "#94A3B8" : "#666"} />}
                        <Text style={[styles.inlineBtnText, { color: item.completed ? '#22C55E' : (currentTheme.isDark ? '#94A3B8' : '#666') }]}>{t.mark}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* TAB 3: SETTINGS TAB */}
          {currentTab === 'settings' && (
            <View style={styles.tabContent}>
              <Text style={[styles.sectionHeading, { color: currentTheme.primary }]}>{t.settings}</Text>

              <View style={[styles.professionalCard, currentTheme.isDark && { backgroundColor: '#1E293B' }]}>
                <View style={styles.profileHeaderLayout}>
                  <View style={[styles.avatarCircularContainer, { backgroundColor: currentTheme.primary }]}>
                    <User size={24} color="#FFF" />
                  </View>
                  <View style={{ marginLeft: 14, flex: 1 }}>
                    <Text style={[styles.profileSystemTitle, { color: currentTheme.textMain }]}>System Administrator</Text>
                    <Text style={[styles.profileMetaEmail, { color: currentTheme.textSub }]} numberOfLines={1}>{userEmail || 'Active Admin Account'}</Text>
                  </View>
                </View>

                <View style={[styles.configDividerLine, { backgroundColor: currentTheme.isDark ? '#334155' : '#F1F5F9' }]} />

                {/* THEME CONTROL ENGINE */}
                <View style={{ marginBottom: 12 }}>
                  <View style={styles.rowLeftIconsContainer}>
                    <View style={[styles.miniIconBg, { backgroundColor: currentTheme.isDark ? '#334155' : '#F1F5F9' }]}>
                      <Palette size={18} color={currentTheme.primary} />
                    </View>
                    <Text style={[styles.premiumMenuText, { color: currentTheme.textMain }]}>App Theme Control Dashboard</Text>
                  </View>
                  
                  <View style={styles.themeBadgeContainerRows}>
                    {Object.keys(APP_THEMES).map((themeKey) => {
                      const th = APP_THEMES[themeKey];
                      const isSelected = currentTheme.id === th.id;
                      return (
                        <TouchableOpacity 
                          key={themeKey} 
                          // ✅ सुधार 1 (फिक्स्ड): ओपनिंग टैग के अंदर कमेंट्स को सही JavaScript फॉर्मेट में बदला गया
                          style={[
                            styles.themeClickCard,
                            { 
                              borderColor: th.primary,
                              backgroundColor: currentTheme.isDark ? '#1E293B' : '#FFF' 
                            },
                            isSelected && { backgroundColor: th.primary, borderWidth: 2 }
                          ]}
                          onPress={() => updateGlobalThemeInCloud(themeKey)}
                        >
                          <Text style={[
                            styles.themeCardLabel, 
                            { color: th.primary },
                            isSelected && { color: '#FFFFFF', fontWeight: 'bold' }
                          ]}>
                            {th.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={[styles.configDividerLine, { backgroundColor: currentTheme.isDark ? '#334155' : '#F1F5F9' }]} />

                {/* Setting Row 1: Cost Config */}
                <View style={styles.premiumMenuBlock}>
                  <View style={styles.premiumRowHeader}>
                    <View style={styles.rowLeftIconsContainer}>
                      <View style={[styles.miniIconBg, { backgroundColor: currentTheme.isDark ? '#334155' : '#EEF2FF' }]}>
                        <DollarSign size={18} color={currentTheme.primary} />
                      </View>
                      <Text style={[styles.premiumMenuText, { color: currentTheme.textMain }]}>{t.pricingConfig}</Text>
                    </View>
                  </View>
                  <TextInput 
                    style={[styles.premiumNumericalInput, currentTheme.isDark && { backgroundColor: '#334155', color: '#FFF', borderColor: '#475569' }, { color: currentTheme.primary }]} 
                    keyboardType="numeric" 
                    value={costPerKg} 
                    onChangeText={updateGlobalCostInCloud}
                  />
                </View>

                {/* Setting Row 2: Language Selector */}
                <TouchableOpacity style={styles.premiumClickableRow} onPress={() => setLang(lang === 'en' ? 'hi' : 'en')}>
                  <View style={styles.rowLeftIconsContainer}>
                    <View style={[styles.miniIconBg, { backgroundColor: currentTheme.isDark ? '#334155' : '#ECFDF5' }]}>
                      <Globe size={18} color="#059669" />
                    </View>
                    <Text style={[styles.premiumMenuText, { color: currentTheme.textMain }]}>{t.langSelect}</Text>
                  </View>
                  <View style={styles.rowRightBadgeLayout}>
                    <Text style={[styles.badgeLanguageText, currentTheme.isDark && { backgroundColor: '#334155', color: '#FFF' }]}>{lang.toUpperCase()}</Text>
                    <ChevronRight size={16} color="#94A3B8" />
                  </View>
                </TouchableOpacity>

                {/* Setting Row 3: Security Password Reset */}
                <TouchableOpacity style={styles.premiumClickableRow} onPress={handleForgotPassword}>
                  <View style={styles.rowLeftIconsContainer}>
                    <View style={[styles.miniIconBg, { backgroundColor: currentTheme.isDark ? '#334155' : '#FFF7ED' }]}>
                      <KeyRound size={18} color="#D97706" />
                    </View>
                    <Text style={[styles.premiumMenuText, { color: currentTheme.textMain }]}>Reset Security Password</Text>
                  </View>
                  <ChevronRight size={16} color="#94A3B8" />
                </TouchableOpacity>

                {/* Setting Row 4: Logout */}
                <TouchableOpacity style={[styles.premiumClickableRow, { borderBottomWidth: 0, marginTop: 10 }]} onPress={handleLogout}>
                  <View style={styles.rowLeftIconsContainer}>
                    <View style={[styles.miniIconBg, { backgroundColor: '#FEF2F2' }]}>
                      <LogOut size={18} color="#EF4444" />
                    </View>
                    <Text style={[styles.premiumMenuText, { color: '#EF4444', fontWeight: '600' }]}>{t.logout}</Text>
                  </View>
                  <ChevronRight size={16} color="#EF4444" />
                </TouchableOpacity>

              </View>
            </View>
          )}
        </ScrollView>

        {/* BOTTOM NAVBAR */}
        <View style={[styles.bottomNavbar, currentTheme.isDark && { backgroundColor: '#1E293B', borderTopColor: '#334155' }]}>
          <TouchableOpacity style={[styles.navTab, currentTab === 'newEntry' && { borderTopColor: currentTheme.secondary }]} onPress={() => setCurrentTab('newEntry')}>
            <PlusCircle size={22} color={currentTab === 'newEntry' ? currentTheme.secondary : currentTheme.primary} />
            <Text style={[styles.navLabel, { color: currentTab === 'newEntry' ? currentTheme.secondary : currentTheme.primary }]}>{t.newEntry}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navTab, currentTab === 'orders' && { borderTopColor: currentTheme.secondary }]} onPress={() => setCurrentTab('orders')}>
            <ClipboardList size={22} color={currentTab === 'orders' ? currentTheme.secondary : currentTheme.primary} />
            <Text style={[styles.navLabel, { color: currentTab === 'orders' ? currentTheme.secondary : currentTheme.primary }]}>{t.orders}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navTab, currentTab === 'settings' && { borderTopColor: currentTheme.secondary }]} onPress={() => setCurrentTab('settings')}>
            <Settings size={22} color={currentTab === 'settings' ? currentTheme.secondary : currentTheme.primary} />
            <Text style={[styles.navLabel, { color: currentTab === 'settings' ? currentTheme.secondary : currentTheme.primary }]}>{t.settings}</Text>
          </TouchableOpacity>
        </View>

        {/* CALENDAR MODAL */}
        <Modal visible={calendarModalVisible} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, currentTheme.isDark && { backgroundColor: '#1E293B' }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: currentTheme.textMain }]}>Filter Logs By Date</Text>
                <TouchableOpacity onPress={() => setCalendarModalVisible(false)}><X size={24} color={currentTheme.textMain} /></TouchableOpacity>
              </View>
              <RNCalendar 
                maxDate={getTodayDateString()} 
                current={selectedDate}
                theme={currentTheme.isDark ? {
                  calendarBackground: '#1E293B',
                  textSectionTitleColor: '#64748B',
                  selectedDayBackgroundColor: currentTheme.primary,
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: currentTheme.secondary,
                  dayTextColor: '#F8FAFC',
                  textDisabledColor: '#334155',
                  monthTextColor: '#FFF'
                } : { selectedDayBackgroundColor: currentTheme.primary }}
                onDayPress={(day) => {
                  setSelectedDate(day.dateString);
                  setCalendarModalVisible(false);
                }}
                markedDates={{ [selectedDate]: { selected: true, selectedColor: currentTheme.primary } }}
              />
            </View>
          </View>
        </Modal>

        {/* PRINT FILTER MODAL */}
        <Modal visible={printModalVisible} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={[styles.confirmBox, currentTheme.isDark && { backgroundColor: '#1E293B' }]}>
              <Printer size={34} color={currentTheme.primary} style={{ marginBottom: 12 }} />
              <Text style={[styles.confirmTitle, { color: currentTheme.textMain }]}>Choose Statement Filter</Text>
              <Text style={[styles.confirmSub, { color: currentTheme.textSub, marginBottom: 16 }]}>Please choose what order records category you want to output into a PDF print format.</Text>
              
              <TouchableOpacity style={[styles.printOptionMenuBtn, { backgroundColor: currentTheme.primary }]} onPress={() => executePrintAction('all')}>
                <Text style={styles.printOptionBtnText}>Print All Records ({filteredOrders.length})</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.printOptionMenuBtn, { backgroundColor: '#22C55E' }]} onPress={() => executePrintAction('completed')}>
                <Text style={styles.printOptionBtnText}>Print Completed Only ({filteredOrders.filter(o=>o.completed).length})</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.printOptionMenuBtn, { backgroundColor: '#EF4444' }]} onPress={() => executePrintAction('pending')}>
                <Text style={styles.printOptionBtnText}>Print Pending Only ({filteredOrders.filter(o=>!o.completed).length})</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.printCancelLinkRow, { marginTop: 8 }]} onPress={() => setPrintModalVisible(false)}>
                <Text style={{ color: currentTheme.textSub, fontWeight: '600' }}>Close Popup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* CUSTOM TOAST POPUP */}
        <Modal visible={statusPopupVisible} animationType="slide" transparent={true}>
          <View style={styles.alertToastContainer}>
            <View style={[styles.alertToastCard, { borderColor: currentTheme.primary }]}>
              <Info size={18} color={currentTheme.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.alertToastText, { color: currentTheme.primary }]}>{statusPopupMsg}</Text>
            </View>
          </View>
        </Modal>

        {/* DELETE MODAL */}
        <Modal visible={deleteModalVisible} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={[styles.confirmBox, currentTheme.isDark && { backgroundColor: '#1E293B' }]}>
              <ShieldAlert size={36} color="#EF4444" style={{ marginBottom: 10 }} />
              <Text style={[styles.confirmTitle, { color: '#EF4444' }]}>Erase Record Log?</Text>
              <Text style={[styles.confirmSub, { color: currentTheme.textSub }]}>Are you sure you want to completely delete this entry from cloud?</Text>
              <View style={styles.confirmActions}>
                <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: '#64748B' }]} onPress={() => setDeleteModalVisible(false)}>
                  <Text style={styles.confirmBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: '#EF4444' }]} onPress={executeDelete}>
                  <Text style={styles.confirmBtnText}>Confirm Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  responsiveSafeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 5 : 5 },
  
  stickyHeaderWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)', 
    paddingHorizontal: 20, 
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
    zIndex: 99
  },

  scrollContainer: { paddingBottom: 110, paddingTop: 10 },
  authWrapper: { flex: 1, justifyContent: 'center', padding: 20 },
  authBoxCard: { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 24, padding: 24, elevation: 8 },
  authSubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  fieldSection: { marginBottom: 16 },
  passwordInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#D8F3F7' },
  authPrimaryBtn: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  authBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  brandTitle: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  brandSub: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  wheatLogo: { fontSize: 46, textAlign: 'center', marginBottom: 5 },
  logoSpacing: { marginTop: 15, marginBottom: 15 },
  tabContent: { paddingHorizontal: 20 },
  formGroup: { backgroundColor: 'rgba(255, 255, 255, 0.65)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 10 },
  
  modernInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8F3F7',
    marginBottom: 10,
    paddingHorizontal: 12
  },
  inputPrefixIcon: {
    marginRight: 10
  },
  modernInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000'
  },

  formInput: { backgroundColor: '#FFF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#D8F3F7', fontSize: 16, marginBottom: 10, color: '#000' },
  middleButtonWrapper: { alignItems: 'center', marginTop: 15 },
  // ✅ सुधार 2 (फिक्स्ड): यहाँ स्टाइलशीट ऑब्जेक्ट के अंदर कमेंट को सही जावास्क्रिप्ट फॉर्मेट (//) में बदल दिया गया है
  saveButton: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  orderHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  dateText: { fontSize: 22, fontWeight: '700', flex: 1 },
  iconActionContainer: { flexDirection: 'row' },
  headerIconBtn: { marginLeft: 16, padding: 6 },
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 12, borderRadius: 12, marginBottom: 14 },
  searchBar: { flex: 1, paddingVertical: 10, fontSize: 15 },
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#FFF', paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: '#E2D9F3' },
  summaryCol: { alignItems: 'center', flex: 1 },
  summaryVal: { fontSize: 22, fontWeight: 'bold' },
  summaryLabel: { fontSize: 12, marginTop: 2 },
  dividerLine: { width: 1, height: 35 },
  orderCard: { borderRadius: 20, padding: 16, marginBottom: 16, elevation: 2 },
  completedCard: { backgroundColor: '#F0FDF4' },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  serialBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  serialText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  cardCustomerName: { fontSize: 18, fontWeight: 'bold' },
  strikethrough: { textDecorationLine: 'line-through', color: '#22C55E' },
  cardLocation: { fontSize: 13 },
  cardTimestamp: { fontSize: 13 },
  cardMiddleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  infoBox: { flex: 0.48, backgroundColor: '#FFF', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E2D9F3' },
  boxLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  boxVal: { fontSize: 16, fontWeight: 'bold' },
  cardActionRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 12 },
  inlineActionBtn: { flexDirection: 'row', alignItems: 'center', padding: 4 },
  inlineBtnText: { marginLeft: 5, fontWeight: '600', fontSize: 14 },
  sectionHeading: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  
  professionalCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, elevation: 4 },
  profileHeaderLayout: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  avatarCircularContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  profileSystemTitle: { fontSize: 16, fontWeight: '700' },
  profileMetaEmail: { fontSize: 13, marginTop: 1 },
  configDividerLine: { height: 1, marginVertical: 18 },
  premiumMenuBlock: { marginBottom: 12 },
  premiumRowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  rowLeftIconsContainer: { flexDirection: 'row', alignItems: 'center' },
  miniIconBg: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  premiumMenuText: { fontSize: 15, fontWeight: '600' },
  premiumNumericalInput: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 16, fontWeight: '700' },
  premiumClickableRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  rowRightBadgeLayout: { flexDirection: 'row', alignItems: 'center' },
  badgeLanguageText: { fontSize: 12, fontWeight: 'bold', color: '#475569', backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden', marginRight: 8 },

  themeBadgeContainerRows: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  themeClickCard: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, minWidth: '47%', alignItems: 'center', marginBottom: 4 },
  themeCardLabel: { fontSize: 13, fontWeight: '600' },

  printOptionMenuBtn: { width: '100%', padding: 14, borderRadius: 12, alignItems: 'center', marginVertical: 6 },
  printOptionBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  printCancelLinkRow: { padding: 10 },

  bottomNavbar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E2D9F3' },
  navTab: { alignItems: 'center', justifyContent: 'center', flex: 1, height: '100%', borderTopWidth: 2, borderTopColor: 'transparent' },
  navLabel: { fontSize: 11, marginTop: 4, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 20, padding: 15 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  confirmBox: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, alignItems: 'center', width: '100%' },
  confirmTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  confirmSub: { fontSize: 14, textAlign: 'center', marginBottom: 20 },
  confirmActions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  confirmBtn: { flex: 0.48, padding: 12, borderRadius: 10, alignItems: 'center' },
  confirmBtnText: { color: '#FFF', fontWeight: 'bold' },
  alertToastContainer: { position: 'absolute', bottom: 90, left: 20, right: 20, alignItems: 'center' },
  alertToastCard: { backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 25, borderWidth: 1, elevation: 4 },
  alertToastText: { fontWeight: '600', fontSize: 14 },
  emptyContainer: { alignItems: 'center', marginTop: 40, padding: 20, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)' },
  reloadBtn: { padding: 8, borderRadius: 8, marginTop: 10 }
});
