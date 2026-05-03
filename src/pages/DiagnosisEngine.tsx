import React, { useState, useEffect, useCallback } from 'react';
import { Activity, AlertTriangle, ChevronRight, Target, Users, Image as ImageIcon, DollarSign, Wrench, Search, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useFilters } from '../lib/FilterContext';
import { cn, safeJson } from '../lib/utils';
import { operatorApi } from '../lib/operatorApi';
import { useNavigate } from 'react-router-dom';
import { usePersistedState } from '../hooks/usePersistedState';

export function DiagnosisEngine() {
  const { user } = useAuth();
  const { selectedAccountId, datePreset, metaToken, googleToken, tiktokToken, platform, metaSubPlatform } = useFilters();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [diagnoses, setDiagnoses] = usePersistedState<any[]>('diagnosis_results', []);

  const getToken = useCallback(() => {
    if (platform === 'meta') return metaToken;
    if (platform === 'google') return googleToken;
    if (platform === 'tiktok') return tiktokToken;
    return null;
  }, [platform, metaToken, googleToken, tiktokToken]);

  useEffect(() => {
    const fetchAndDiagnose = async () => {
      const token = getToken();
      if (!token || !selectedAccountId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      const headers = {
        'x-user-id': user!.uid,
        [`x-${platform}-token`]: token
      };

      try {
        const response = await operatorApi.getAudit();
        const audits = response.data.audits || [];

        const newDiagnoses: any[] = [];

        audits.forEach((audit: any) => {
          if (audit.status === 'NO_DATA') return;
          if (!audit.issues || audit.issues.length === 0) return;

          audit.issues.forEach((issue: any, index: number) => {
            newDiagnoses.push({
              id: `${audit.campaignId}_${index}`,
              name: `Campaign ID: ${audit.campaignId}`,
              level: 'Campaign',
              metrics: { spend: 0, roas: 0, cpa: 0, ctr: 0 }, // Using mocked metrics to populate the UI view
              problemType: issue.problem.includes('Acquisition') ? 'Budget' : issue.problem.includes('CTR') ? 'Creative' : 'Funnel',
              reason: issue.cause,
              suggestedFix: [issue.fix],
              priorityLevel: 'High',
              confidenceScore: 'High confidence',
              explanation: `The intelligent audit engine detected: ${issue.problem}.`
            });
          });
        });

        setDiagnoses(newDiagnoses);
      } catch (error) {
        console.error('Failed to fetch audits', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndDiagnose();
  }, [selectedAccountId, platform, metaSubPlatform, datePreset, user, getToken, setDiagnoses]);

  const [toast, setToast] = useState<{ message: string, type: 'success' | 'info' | 'error' } | null>(null);

  const handleActionClick = (action: string, id: string) => {
    // In a real app, this would trigger a specific workflow or modal
    setToast({ message: `Triggering action: ${action} for item ${id}`, type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const handleItemClick = (id: string, level: string) => {
    if (level === 'Campaign') {
      navigate('/campaigns');
    } else if (level === 'Ad') {
      navigate('/creatives');
    } else {
      navigate('/campaigns');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!selectedAccountId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md w-full">
          <Search className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Connected</h2>
          <p className="text-gray-500 mb-6">Select an account to run the Diagnosis Engine.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Funnel Mapping & Diagnostics</h1>
          <p className="text-gray-400 text-sm mt-1">Autonomous tracking of creative performance from "First Impression" to "Final Conversion".</p>
        </div>
      </div>

      {diagnoses.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-200 shadow-sm text-center">
          <Activity className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">All Clear!</h2>
          <p className="text-gray-500">No major issues detected in the selected date range.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {diagnoses.map((diagnosis) => (
            <div key={diagnosis.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div 
                className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleItemClick(diagnosis.id, diagnosis.level)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    diagnosis.priorityLevel === 'High' ? "bg-red-100 text-red-600" :
                    diagnosis.priorityLevel === 'Medium' ? "bg-yellow-100 text-yellow-600" :
                    "bg-blue-100 text-blue-600"
                  )}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{diagnosis.level}</span>
                      <ChevronRight className="w-3 h-3 text-gray-400" />
                      <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">{diagnosis.name}</h3>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>Spend: ${diagnosis.metrics.spend.toFixed(2)}</span>
                      <span>ROAS: {diagnosis.metrics.roas.toFixed(2)}x</span>
                      <span>CPA: ${diagnosis.metrics.cpa.toFixed(2)}</span>
                      <span>CTR: {diagnosis.metrics.ctr.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-medium text-gray-500 uppercase">Priority</div>
                    <div className={cn(
                      "font-bold",
                      diagnosis.priorityLevel === 'High' ? "text-red-600" :
                      diagnosis.priorityLevel === 'Medium' ? "text-yellow-600" :
                      "text-blue-600"
                    )}>{diagnosis.priorityLevel}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-gray-500 uppercase">Confidence</div>
                    <div className="font-bold text-gray-900">{diagnosis.confidenceScore}</div>
                  </div>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1 flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-400" />
                      Problem Type
                    </h4>
                    <p className="text-lg font-medium text-gray-800">{diagnosis.problemType}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-gray-400" />
                      Reason
                    </h4>
                    <p className="text-gray-700">{diagnosis.reason}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-gray-400" />
                      Explanation
                    </h4>
                    <p className="text-gray-600 text-sm">{diagnosis.explanation}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-gray-400" />
                      Suggested Fix
                    </h4>
                    <ul className="space-y-2 mb-4">
                      {diagnosis.suggestedFix.map((fix: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                          {fix}
                        </li>
                      ))}
                    </ul>
                    
                    <div className="flex flex-wrap gap-2">
                      {diagnosis.problemType === 'Creative' && (
                        <button 
                          onClick={() => handleActionClick('Fix Creative', diagnosis.id)}
                          className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <ImageIcon className="w-4 h-4" />
                          Fix Creative
                        </button>
                      )}
                      {diagnosis.problemType === 'Audience' && (
                        <button 
                          onClick={() => handleActionClick('Fix Audience', diagnosis.id)}
                          className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <Users className="w-4 h-4" />
                          Fix Audience
                        </button>
                      )}
                      {diagnosis.problemType === 'Funnel' && (
                        <button 
                          onClick={() => handleActionClick('Fix Funnel', diagnosis.id)}
                          className="px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <Target className="w-4 h-4" />
                          Fix Funnel
                        </button>
                      )}
                      {diagnosis.problemType === 'Budget' && (
                        <button 
                          onClick={() => handleActionClick('Optimize Budget', diagnosis.id)}
                          className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <DollarSign className="w-4 h-4" />
                          Optimize Budget
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <div className={cn(
            "px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 border",
            toast.type === 'success' ? "bg-green-50 border-green-200 text-green-800" :
            toast.type === 'error' ? "bg-red-50 border-red-200 text-red-800" :
            "bg-blue-50 border-blue-200 text-blue-800"
          )}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-500" />}
            {toast.type === 'info' && <Activity className="w-5 h-5 text-blue-500" />}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
