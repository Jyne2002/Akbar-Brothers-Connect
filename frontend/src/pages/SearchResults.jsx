import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Briefcase, Building2, MapPin, Phone, Search, UserCircle } from 'lucide-react';
import { getCompanyLabel } from '../constants/companies';
import api from '../utils/api';
import { getStoredUser } from '../utils/auth';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const userInfo = getStoredUser();
  const query = searchParams.get('query')?.trim() || '';

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!query) {
        setEmployees([]);
        return;
      }

      try {
        setLoading(true);
        const config = {
          headers: { Authorization: `Bearer ${userInfo?.token}` },
        };
        const { data } = await api.get(`/api/employees?search=${encodeURIComponent(query)}`, config);
        setEmployees(data);
      } catch (error) {
        console.error('Failed to search employees', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [query, userInfo?.token]);

  return (
    <div className="space-y-8 pb-12 pt-4 animate-in fade-in duration-500">
      <section className="rounded-[1.8rem] border border-white/50 bg-white/85 p-7 shadow-[0_22px_50px_rgba(20,40,11,0.08)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/70">
              Search
            </p>
            <h1 className="mt-2 text-3xl font-black text-black">
              Employee search results
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/75">
              Use the navbar search bar to look up any employee across all companies. Results are grouped here
              so you can jump to the right company directory.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--color-tea-green)]/60 bg-[var(--color-tea-green)]/30 px-4 py-3 text-sm font-semibold text-black">
            {query ? `Query: ${query}` : 'Enter a name, role, or employee ID above'}
          </div>
        </div>
      </section>

      {!query ? (
        <div className="rounded-[1.8rem] border border-dashed border-white/70 bg-white/70 p-10 text-center text-black/70">
          Start typing in the navbar search bar to find employees from any company.
        </div>
      ) : loading ? (
        <div className="flex justify-center p-12">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-tea-dark)]" />
        </div>
      ) : employees.length === 0 ? (
        <div className="rounded-[1.8rem] border border-white/60 bg-white/75 p-10 text-center shadow-sm">
          <Search className="mx-auto mb-4 h-10 w-10 text-[var(--color-earth-brown)]/35" />
          <h2 className="text-xl font-bold text-black">No employees found</h2>
          <p className="mt-2 text-sm text-black/70">
            Try another name, role, phone number, or employee ID.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {employees.map((employee) => (
            <div
              key={employee._id}
              className="rounded-[1.7rem] border border-white/60 bg-white/84 p-6 shadow-[0_20px_44px_rgba(22,40,12,0.08)]"
            >
              <div className="flex gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-tea-green)]/55 text-black">
                  <UserCircle className="h-8 w-8" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-black">
                        {employee.name}
                      </h2>
                      <p className="mt-1 flex items-center gap-2 text-sm font-medium text-black">
                        <Briefcase className="h-4 w-4" />
                        {employee.position}
                      </p>
                    </div>

                    <span className="rounded-full border border-[var(--color-tea-green)]/70 bg-[var(--color-tea-green)]/35 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-black">
                      {getCompanyLabel(employee.company)}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm text-black/78">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[var(--color-tea-dark)]/60" />
                      {employee.phoneNumber}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[var(--color-tea-dark)]/60" />
                      {employee.address}
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-[var(--color-tea-dark)]/60" />
                      Employee ID: {employee.employeeId}
                    </div>
                  </div>

                  <Link
                    to={`/company/${encodeURIComponent(employee.company)}`}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-red)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-red-dark)]"
                  >
                    Open {getCompanyLabel(employee.company)}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
