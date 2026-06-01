import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search, UserCircle, MapPin, Phone, Briefcase } from 'lucide-react';
import { getCompanyLabel } from '../constants/companies';
import api from '../utils/api';
import { getStoredUser } from '../utils/auth';

const CompanyDirectory = () => {
  const { companyId } = useParams();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const decodedCompany = decodeURIComponent(companyId);
  const companyLabel = getCompanyLabel(decodedCompany);
  const userInfo = getStoredUser();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const config = {
          headers: { Authorization: `Bearer ${userInfo?.token}` }
        };
        const { data } = await api.get(`/api/employees?company=${decodedCompany}&search=${searchTerm}`, config);
        setEmployees(data);
      } catch (error) {
        console.error("Failed to fetch employees", error);
      } finally {
        setLoading(false);
      }
    };
    
    const delayDebounceFn = setTimeout(() => {
      fetchEmployees();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [decodedCompany, searchTerm, userInfo?.token]);

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-black">{companyLabel} Directory</h1>
          <p className="text-gray-500 mt-1">Manage and view employee records</p>
        </div>
        <div className="relative max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[var(--color-tea-dark)] focus:border-[var(--color-tea-dark)] bg-white"
            placeholder="Search employees by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-tea-dark)]"></div>
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <UserCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No employees found</h3>
          <p className="text-gray-500">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <div key={employee._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-tea-green)] group-hover:bg-[var(--color-tea-dark)] transition-colors"></div>
              <div className="flex items-start space-x-4">
                <div className="bg-[var(--color-beige)] rounded-full p-3 text-black mt-1 shrink-0">
                  <UserCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-black">{employee.name}</h3>
                  <div className="flex items-center text-sm text-black font-medium mt-1">
                    <Briefcase className="w-4 h-4 mr-1.5" />
                    {employee.position}
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {employee.phoneNumber}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {employee.address}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-tea-green)] text-black">
                        ID: {employee.employeeId}
                     </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyDirectory;
