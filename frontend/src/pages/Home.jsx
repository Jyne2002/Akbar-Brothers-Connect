import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Users } from 'lucide-react';
import { COMPANIES } from '../constants/companies';
import api from '../utils/api';
import { getStoredUser } from '../utils/auth';

const Home = () => {
  const [employeeCounts, setEmployeeCounts] = useState({});
  const userInfo = getStoredUser();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo?.token}` },
        };
        const { data } = await api.get('/api/employees/counts', config);
        setEmployeeCounts(data);
      } catch (error) {
        console.error('Failed to load employee counts', error);
      }
    };

    fetchCounts();
  }, [userInfo?.token]);

  return (
    <div className="space-y-6 pb-3 pt-4 animate-in fade-in duration-500 lg:space-y-6 lg:pt-5">
      <section
        className="relative overflow-hidden rounded-[2rem] border border-white/30 bg-cover bg-center px-5 py-6 shadow-[0_24px_48px_rgba(16,29,10,0.16)] sm:px-7 lg:min-h-[14rem] lg:px-8 lg:py-7"
        style={{ backgroundImage: "url('/akbar-home-hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(125deg,_rgba(17,42,8,0.56)_0%,_rgba(30,66,16,0.32)_38%,_rgba(10,21,5,0.16)_100%)]" />
        <div className="relative flex h-full items-end">
          <div className="max-w-3xl">
            <h1 className="font-poppins text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.28)] sm:text-4xl lg:text-[2.6rem]">
              World's Largest Tea Exporter
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/92 drop-shadow-[0_3px_10px_rgba(0,0,0,0.24)] sm:text-base">
              An expanding global presence and a universal consumer favourite, Akbar Brothers
              continues to lead the Ceylon tea market with a century&apos;s expertise and unparalleled
              customer service.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-3 grid gap-4 lg:mt-4 lg:grid-cols-3">
        {COMPANIES.map((company) => (
          <Link
            key={company.id}
            to={`/company/${encodeURIComponent(company.id)}`}
            className="group relative overflow-hidden rounded-[1.8rem] border border-white/50 bg-white/88 p-6 shadow-[0_20px_40px_rgba(20,40,11,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_46px_rgba(20,40,11,0.13)]"
          >
            <div className="absolute inset-0 bg-[linear-gradient(145deg,_rgba(220,237,200,0.42)_0%,_rgba(255,255,255,0)_65%)] opacity-80 transition group-hover:opacity-100" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-tea-green)]/55 text-[var(--color-tea-dark)] shadow-inner">
                  <Building2 className="h-7 w-7" />
                </div>
                <span className="rounded-full border border-[var(--color-tea-green)]/80 bg-[var(--color-tea-green)]/45 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-black">
                  {company.code}
                </span>
              </div>

              <h2 className="mt-5 text-xl font-black text-black">
                {company.name}
              </h2>

              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[var(--color-cream-white)]/85 px-4 py-3">
                <Users className="h-5 w-5 text-[var(--color-tea-dark)]" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/70">
                    Employees
                  </p>
                  <p className="text-lg font-bold text-black">
                    {employeeCounts[company.id] || 0}
                  </p>
                </div>
              </div>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-black">
                Open company directory
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
};

export default Home;
