'use client';

import { useState, useEffect } from 'react';
import { Check, X, RefreshCw, Store, MapPin, Phone, Globe, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient, { getFullApiUrl } from '@/lib/api-client';

interface Store {
  id: string;
  name: string;
  address: string;
  detailAddress?: string;
  lat: number;
  lng: number;
  description?: string;
  phone?: string;
  website?: string;
  ownerAddress: string;
  status: string;
  createdAt: string;
}

interface StoresResponse {
  stores: Store[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statusCounts?: {
    pending: number;
    approved: number;
    denied: number;
    total: number;
  };
}

type TabType = 'all' | 'pending' | 'approved' | 'denied';

export default function AdminPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    denied: 0,
    total: 0,
  });

  // 매장 목록 조회
  const fetchStores = async () => {
    try {
      setIsLoading(true);
      const statusParam = activeTab === 'all' ? '' : `&status=${activeTab}`;
      const response = await fetch(getFullApiUrl(`/api/admin/stores?page=${page}&limit=10${statusParam}`));
      const data = await response.json();

      if (data.success) {
        setStores(data.data.stores);
        setTotalPages(data.data.pagination.totalPages);
        setTotal(data.data.pagination.total);
        if (data.data.statusCounts) {
          setStatusCounts(data.data.statusCounts);
        }
      }
    } catch (error) {
      console.error('매장 목록 조회 실패:', error);
      toast.error('매장 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [page, activeTab]);

  // 탭 변경 시 페이지 리셋
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setPage(1);
  };

  // 매장 승인
  const handleApprove = async (storeId: string) => {
    if (processingIds.has(storeId)) return;

    try {
      setProcessingIds(prev => new Set(prev).add(storeId));
      
      const response = await fetch(getFullApiUrl(`/api/admin/stores/${storeId}/approve`), {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        toast.success('매장이 승인되었습니다.');
        fetchStores(); // 목록 새로고침
      } else {
        toast.error('승인에 실패했습니다.');
      }
    } catch (error) {
      console.error('매장 승인 실패:', error);
      toast.error('승인 처리 중 오류가 발생했습니다.');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(storeId);
        return next;
      });
    }
  };

  // 매장 거부
  const handleReject = async (storeId: string) => {
    if (processingIds.has(storeId)) return;

    if (!confirm('정말 이 매장을 거부하시겠습니까?')) return;

    try {
      setProcessingIds(prev => new Set(prev).add(storeId));
      
      const response = await fetch(getFullApiUrl(`/api/admin/stores/${storeId}/reject`), {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        toast.success('매장이 거부되었습니다.');
        fetchStores(); // 목록 새로고침
      } else {
        toast.error('거부에 실패했습니다.');
      }
    } catch (error) {
      console.error('매장 거부 실패:', error);
      toast.error('거부 처리 중 오류가 발생했습니다.');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(storeId);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">QT Pay 관리자</h1>
                <p className="text-sm text-gray-500">매장 승인 관리</p>
              </div>
            </div>
            <button
              onClick={fetchStores}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>새로고침</span>
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">전체</p>
                <p className="text-3xl font-bold text-gray-900">{statusCounts.total}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-gray-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">승인 대기</p>
                <p className="text-3xl font-bold text-orange-500">{statusCounts.pending}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">승인됨</p>
                <p className="text-3xl font-bold text-green-500">{statusCounts.approved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">거부됨</p>
                <p className="text-3xl font-bold text-red-500">{statusCounts.denied}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="flex">
            <button
              onClick={() => handleTabChange('all')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              전체 ({statusCounts.total})
            </button>
            <button
              onClick={() => handleTabChange('pending')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              승인 대기 ({statusCounts.pending})
            </button>
            <button
              onClick={() => handleTabChange('approved')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'approved'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              승인됨 ({statusCounts.approved})
            </button>
            <button
              onClick={() => handleTabChange('denied')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'denied'
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              거부됨 ({statusCounts.denied})
            </button>
          </div>
        </div>

        {/* 매장 목록 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : stores.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab === 'pending' && '승인 대기 중인 매장이 없습니다'}
              {activeTab === 'approved' && '승인된 매장이 없습니다'}
              {activeTab === 'denied' && '거부된 매장이 없습니다'}
              {activeTab === 'all' && '등록된 매장이 없습니다'}
            </h3>
            <p className="text-gray-500">
              {activeTab === 'pending' && '새로운 매장 등록 요청이 들어오면 여기에 표시됩니다.'}
              {activeTab === 'approved' && '승인된 매장이 여기에 표시됩니다.'}
              {activeTab === 'denied' && '거부된 매장이 여기에 표시됩니다.'}
              {activeTab === 'all' && '매장 등록이 시작되면 여기에 표시됩니다.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {stores.map((store) => (
              <div
                key={store.id}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  {/* 매장 정보 */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Store className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                          {store.status === 'approved' && (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                              승인됨
                            </span>
                          )}
                          {store.status === 'pending' && (
                            <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                              대기중
                            </span>
                          )}
                          {store.status === 'denied' && (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                              거부됨
                            </span>
                          )}
                        </div>
                        {store.description && (
                          <p className="text-sm text-gray-600 mt-1">{store.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-13">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">
                          {store.address} {store.detailAddress}
                        </span>
                      </div>

                      {store.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>{store.phone}</span>
                        </div>
                      )}

                      {store.website && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <a
                            href={store.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline truncate"
                          >
                            {store.website}
                          </a>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>{new Date(store.createdAt).toLocaleString('ko-KR')}</span>
                      </div>
                    </div>

                    <div className="pl-13">
                      <p className="text-xs text-gray-400">
                        소유자: {store.ownerAddress.slice(0, 10)}...{store.ownerAddress.slice(-8)}
                      </p>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  {store.status === 'pending' && (
                    <div className="flex space-x-3 lg:ml-6">
                      <button
                        onClick={() => handleApprove(store.id)}
                        disabled={processingIds.has(store.id)}
                        className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="w-5 h-5" />
                        <span className="font-medium">승인</span>
                      </button>
                      <button
                        onClick={() => handleReject(store.id)}
                        disabled={processingIds.has(store.id)}
                        className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-5 h-5" />
                        <span className="font-medium">거부</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

