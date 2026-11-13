import { supabase, isSupabaseConfigured } from './supabase';

const LOCAL_STORAGE_KEY = 'reportsaathi_guest_history';

export const getStoredReports = async (user) => {
  // If user is authenticated with Supabase
  if (isSupabaseConfigured && supabase && user?.id) {
    const { data, error } = await supabase
      .from('report_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Failed to fetch reports from Supabase:", error);
      throw error;
    }
    return data.map(item => ({
      id: item.id,
      title: item.report_title,
      category: item.category,
      reportDate: item.report_date,
      summary: item.overview_summary,
      keyFindings: item.key_findings || [],
      parameters: item.parameters || [],
      questionsForDoctor: item.questions_for_doctor || [],
      generalAdvice: item.general_advice || [],
      createdAt: item.created_at,
      isCloudSynced: true,
    }));
  }

  // Fallback: Local browser session memory
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const saveReportRecord = async (report, user) => {
  // Payload for storage: Notice raw PDF/image files and OCR transcripts are NOT stored
  const payload = {
    report_title: report.title || "Clinical Laboratory Report",
    category: report.category || "Clinical Pathology",
    report_date: report.reportDate || "",
    overview_summary: report.summary || "",
    key_findings: report.keyFindings || [],
    parameters: report.parameters || [],
    questions_for_doctor: report.questionsForDoctor || [],
    general_advice: report.generalAdvice || [],
  };

  if (isSupabaseConfigured && supabase && user?.id) {
    const { data, error } = await supabase
      .from('report_history')
      .insert({
        ...payload,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      ...report,
      createdAt: data.created_at,
      isCloudSynced: true,
    };
  }

  // If Supabase is absent or user is in guest mode, store in local session storage
  const guestRecord = {
    id: `guest-${Date.now()}`,
    ...report,
    createdAt: new Date().toISOString(),
    isCloudSynced: false,
  };

  try {
    const current = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const updated = [guestRecord, ...current.slice(0, 19)]; // Keep last 20
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Unable to save to local storage:", e);
  }

  return guestRecord;
};

export const deleteReportRecord = async (reportId, user) => {
  if (isSupabaseConfigured && supabase && user?.id && !reportId.startsWith('guest-')) {
    const { error } = await supabase
      .from('report_history')
      .delete()
      .eq('id', reportId);

    if (error) throw error;
    return true;
  }

  // Delete from local session storage
  try {
    const current = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const filtered = current.filter(r => r.id !== reportId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn("Unable to delete from local storage:", e);
  }

  return true;
};
