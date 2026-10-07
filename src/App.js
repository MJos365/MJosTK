import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialisation de Supabase avec les variables d'environnement de Vercel
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('students');
  const [loading, setLoading] = useState(false);

  // États pour les données
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [payments, setPayments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  // Formulaires
  const [studentForm, setStudentForm] = useState({ first_name: '', last_name: '', email: '', phone: '' });
  const [paymentForm, setPaymentForm] = useState({ enrollment_id: '', amount: '', method: 'Espèces' });
  const [scheduleForm, setScheduleForm] = useState({ course_id: '', day_of_week: 'Lundi', start_time: '', end_time: '', room: '' });

  useEffect(() => {
    // Vérifier si un utilisateur est déjà connecté
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const { data: st } = await supabase.from('students').select('*');
    const { data: co } = await supabase.from('courses').select('*');
    const { data: sc } = await supabase.from('schedules').select('*');
    const { data: pa } = await supabase.from('payments').select('*');
    const { data: en } = await supabase.from('enrollments').select('*, students(first_name, last_name), courses(name)');
    
    setStudents(st || []);
    setCourses(co || []);
    setSchedules(sc || []);
    setPayments(pa || []);
    setEnrollments(en || []);
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert('Inscription réussie ! Vérifiez vos emails.');
  };

  const handleLogout = () => supabase.auth.signOut();

  const addStudent = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('students').insert([studentForm]);
    if (error) alert(error.message);
    else {
      setStudentForm({ first_name: '', last_name: '', email: '', phone: '' });
      fetchData();
    }
  };

  const addPayment = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('payments').insert([paymentForm]);
    if (error) alert(error.message);
    else {
      setPaymentForm({ enrollment_id: '', amount: '', method: 'Espèces' });
      fetchData();
    }
  };

  const addSchedule = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('schedules').insert([scheduleForm]);
    if (error) alert(error.message);
    else {
      setScheduleForm({ course_id: '', day_of_week: 'Lundi', start_time: '', end_time: '', room: '' });
      fetchData();
    }
  };

  // Écran de connexion si non connecté
  if (!user) {
    return (
      <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif' }}>
        <h2>Connexion Centre de Formation</h2>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', margin: '8px 0' }} />
          <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', margin: '8px 0' }} />
          <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Se connecter</button>
          <button type="button" onClick={handleSignUp} style={{ width: '100%', padding: '10px', backgroundColor: '#222', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '8px' }}>Créer un compte</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eaeaea', paddingBottom: '10px' }}>
        <h1>🎓 Gestion de mon Centre de Formation</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Déconnexion</button>
      </div>

      {/* Onglets */}
      <div style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
        <button onClick={() => setActiveTab('students')} style={{ padding: '10px 20px', backgroundColor: activeTab === 'students' ? '#0070f3' : '#ddd', color: activeTab === 'students' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>👥 Étudiants</button>
        <button onClick={() => setActiveTab('payments')} style={{ padding: '10px 20px', backgroundColor: activeTab === 'payments' ? '#0070f3' : '#ddd', color: activeTab === 'payments' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>💰 Paiements</button>
        <button onClick={() => setActiveTab('schedules')} style={{ padding: '10px 20px', backgroundColor: activeTab === 'schedules' ? '#0070f3' : '#ddd', color: activeTab === 'schedules' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>📅 Horaires</button>
      </div>

      {loading ? <p>Chargement des données...</p> : (
        <div>
          {/* Onglet ÉTUDIANTS */}
          {activeTab === 'students' && (
            <div>
              <h3>Inscrire un nouvel Étudiant</h3>
              <form onSubmit={addStudent} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input type="text" placeholder="Prénom" value={studentForm.first_name} onChange={e => setStudentForm({...studentForm, first_name: e.target.value})} required style={{ padding: '8px' }} />
                <input type="text" placeholder="Nom" value={studentForm.last_name} onChange={e => setStudentForm({...studentForm, last_name: e.target.value})} required style={{ padding: '8px' }} />
                <input type="email" placeholder="Email" value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} required style={{ padding: '8px' }} />
                <input type="text" placeholder="Téléphone" value={studentForm.phone} onChange={e => setStudentForm({...studentForm, phone: e.target.value})} style={{ padding: '8px' }} />
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#23a95d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Ajouter</button>
              </form>

              <h3>Liste des Étudiants inscrits</h3>
              <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f2f2f2' }}>
                    <th>Prénom</th><th>Nom</th><th>Email</th><th>Téléphone</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}><td>{s.first_name}</td><td>{s.last_name}</td><td>{s.email}</td><td>{s.phone}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Onglet PAIEMENTS */}
          {activeTab === 'payments' && (
            <div>
              <h3>Enregistrer un Paiement</h3>
              <form onSubmit={addPayment} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <select value={paymentForm.enrollment_id} onChange={e => setPaymentForm({...paymentForm, enrollment_id: e.target.value})} required style={{ padding: '8px' }}>
                  <option value="">Sélectionner une inscription</option>
                  {enrollments.map(e => (
                    <option key={e.id} value={e.id}>{e.students?.first_name} {e.students?.last_name} - {e.courses?.name}</option>
                  ))}
                </select>
                <input type="number" placeholder="Montant (€)" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} required style={{ padding: '8px' }} />
                <select value={paymentForm.method} onChange={e => setPaymentForm({...paymentForm, method: e.target.value})} style={{ padding: '8px' }}>
                  <option value="Espèces">Espèces</option>
                  <option value="Carte Bancaire">Carte Bancaire</option>
                  <option value="Virement">Virement</option>
                </select>
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#23a95d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Valider le paiement</button>
              </form>

              <h3>Historique des Paiements</h3>
