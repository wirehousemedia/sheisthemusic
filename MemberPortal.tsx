import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Calendar, CheckCircle, Globe, Loader2, Search, UserCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const CATEGORIES = [
  "Artist",
  "Songwriter",
  "Producer",
  "Engineer / Mixer",
  "Manager",
  "Executive",
  "Lawyer",
  "Publisher",
  "Creative Director",
  "Other Industry Professional",
];

const INTEREST_OPTIONS = [
  { key: "songwriting_camp", label: "Songwriting Lab / Camp" },
  { key: "showcase", label: "Showcases & Artist Performances" },
  { key: "gala", label: "Annual Gala & Events" },
  { key: "networking", label: "Networking & Cocktails" },
  { key: "mentorship", label: "Mentorship Program" },
  { key: "job", label: "Job Opportunities" },
  { key: "grant", label: "Grants & Scholarships" },
  { key: "nashville_songwriters", label: "Nashville Songwriters Connection" },
  { key: "other", label: "Other Opportunities" },
];

export default function MemberPortal() {
  const { user, loading, isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();

  const profileQuery = trpc.members.profile.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const eventsQuery = trpc.events.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const [fullName, setFullName] = useState("");
  const [region, setRegion] = useState("");
  const [phone, setPhone] = useState("");
  const [categoryType, setCategoryType] = useState(CATEGORIES[0]);
  const [careerRole, setCareerRole] = useState("");
  const [company, setCompany] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [race, setRace] = useState("");
  const [sexualOrientation, setSexualOrientation] = useState("");
  const [isPublicDirectory, setIsPublicDirectory] = useState(true);
  const [bio, setBio] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Directory search state
  const [searchRegion, setSearchRegion] = useState("all");
  const [searchCategory, setSearchCategory] = useState("all");
  const [searchInterest, setSearchInterest] = useState("all");
  const [searchKeyword, setSearchKeyword] = useState("");

  const directoryQuery = trpc.members.directory.useQuery({
    region: searchRegion,
    categoryType: searchCategory,
    interestKey: searchInterest,
    search: searchKeyword,
  });

  useEffect(() => {
    if (profileQuery.data?.profile) {
      const p = profileQuery.data.profile;
      setFullName(p.fullName ?? "");
      setRegion(p.region ?? "");
      setPhone(p.phone ?? "");
      setCategoryType(p.categoryType ?? CATEGORIES[0]);
      setCareerRole(p.careerRole ?? "");
      setCompany(p.company ?? "");
      setPronouns(p.pronouns ?? "");
      setRace(p.race ?? "");
      setSexualOrientation(p.sexualOrientation ?? "");
      setIsPublicDirectory(p.isPublicDirectory ?? true);
      setBio(p.bio ?? "");
    }
    if (profileQuery.data?.interests) {
      setSelectedInterests(profileQuery.data.interests);
    }
  }, [profileQuery.data]);

  const upsertMutation = trpc.members.upsertProfile.useMutation({
    onSuccess: async () => {
      await utils.members.profile.invalidate();
      toast.success("Profile saved successfully");
    },
    onError: (err) => toast.error(err.message),
  });

  const registerEventMutation = trpc.events.register.useMutation({
    onSuccess: async () => {
      await eventsQuery.refetch();
      toast.success("Successfully registered for event");
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleInterest = (key: string) => {
    setSelectedInterests((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    upsertMutation.mutate({
      fullName,
      region,
      phone,
      categoryType,
      careerRole,
      company,
      pronouns,
      race,
      sexualOrientation,
      isPublicDirectory,
      bio,
      interests: selectedInterests,
    });
  };

  if (loading || profileQuery.isLoading || !user) {
    return (
      <section className="min-h-[70vh] flex items-center justify-center bg-[#ECECF1]">
        <Loader2 className="w-8 h-8 animate-spin text-[#A20E56]" />
      </section>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[45vh] min-h-[320px] flex items-end overflow-hidden bg-gradient-to-br from-[#44407A] to-[#A20E56]">
        <div className="relative container pb-12">
          <p className="text-white/70 text-xs uppercase tracking-[0.2em] mb-2">She Is The Music Platform</p>
          <h1 className="text-5xl md:text-7xl text-white leading-[0.9]">Member Portal</h1>
          <div className="mt-4 w-16 h-1 bg-white/50" />
        </div>
      </section>

      <section className="py-16 md:py-24 bg-[#ECECF1]">
        <div className="container max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Setup Form */}
            <div className="lg:col-span-2 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <UserCheck className="w-6 h-6 text-[#A20E56]" />
                <h2 className="text-3xl text-[#3E3D44]">Your SITM Member Profile</h2>
              </div>
              <p className="text-[#828297] text-sm mb-8">
                Setup your professional profile, select your creative focus, and connect with peers and catalogs worldwide.
              </p>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-5">
                  <label className="grid gap-2 text-sm font-medium text-[#3E3D44]">
                    Full Name *
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Alicia Jones" />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-[#3E3D44]">
                    Region / City *
                    <Input value={region} onChange={(e) => setRegion(e.target.value)} required placeholder="Nashville, TN / London, UK" />
                  </label>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <label className="grid gap-2 text-sm font-medium text-[#3E3D44]">
                    Email Address
                    <Input value={user.email || ""} disabled className="bg-[#ECECF1] cursor-not-allowed" />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-[#3E3D44]">
                    Phone Number
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                  </label>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <label className="grid gap-2 text-sm font-medium text-[#3E3D44]">
                    Creative Category *
                    <select
                      value={categoryType}
                      onChange={(e) => setCategoryType(e.target.value)}
                      className="h-10 rounded border border-[#D9D8E1] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#A20E56]/30"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-[#3E3D44]">
                    Career Role / Title *
                    <Input value={careerRole} onChange={(e) => setCareerRole(e.target.value)} required placeholder="Lead Songwriter & Producer" />
                  </label>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <label className="grid gap-2 text-sm font-medium text-[#3E3D44]">
                    Company / Organization
                    <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="AK Worldwide / Independent" />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-[#3E3D44]">
                    Pronouns
                    <Input value={pronouns} onChange={(e) => setPronouns(e.target.value)} placeholder="She / Her" />
                  </label>
                </div>

                {/* Optional Demographic Fields */}
                <div className="border-t border-[#ECECF1] pt-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#828297] mb-4">Optional Demographic Data (Privacy-Controlled)</p>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <label className="grid gap-2 text-sm font-medium text-[#3E3D44]">
                      Race / Ethnicity (Optional)
                      <Input value={race} onChange={(e) => setRace(e.target.value)} placeholder="Optional" />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-[#3E3D44]">
                      Sexual Orientation (Optional)
                      <Input value={sexualOrientation} onChange={(e) => setSexualOrientation(e.target.value)} placeholder="Optional" />
                    </label>
                  </div>
                </div>

                {/* Interests Checkboxes */}
                <div className="border-t border-[#ECECF1] pt-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#828297] mb-4">Interests & Program Signups</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {INTEREST_OPTIONS.map((opt) => (
                      <label key={opt.key} className="flex items-center gap-3 text-sm text-[#3E3D44] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedInterests.includes(opt.key)}
                          onChange={() => toggleInterest(opt.key)}
                          className="w-4 h-4 accent-[#A20E56] rounded"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#ECECF1] pt-6">
                  <label className="grid gap-2 text-sm font-medium text-[#3E3D44]">
                    Professional Bio
                    <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Share your background, recent credits, and what you are working on..." />
                  </label>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#ECECF1]">
                  <label className="flex items-center gap-3 text-sm text-[#3E3D44] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublicDirectory}
                      onChange={(e) => setIsPublicDirectory(e.target.checked)}
                      className="w-4 h-4 accent-[#A20E56] rounded"
                    />
                    List my profile in the SITM Member Directory
                  </label>
                  <Button type="submit" disabled={upsertMutation.isPending} className="bg-[#A20E56] hover:bg-[#8a0c49] text-white">
                    {upsertMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Profile
                  </Button>
                </div>
              </form>
            </div>

            {/* Sidebar: Event Registrations */}
            <div className="space-y-6">
              <div className="bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-[#44407A]" />
                  <h3 className="text-xl text-[#44407A]">Upcoming Events & Camps</h3>
                </div>
                <p className="text-[#828297] text-xs mb-6">Register to attend upcoming SITM songwriting camps, showcases, and galas.</p>

                <div className="space-y-4">
                  {[
                    { title: "Nashville All-Female Songwriting Lab", date: "Sept 14-16, 2026", loc: "Jungle City East, Nashville" },
                    { title: "Women Sharing the Spotlight Annual Gala", date: "Oct 28, 2026", loc: "New York City" },
                    { title: "UK Next Up Mentorship Showcase", date: "Nov 12, 2026", loc: "London, UK" },
                  ].map((ev) => {
                    const isRegistered = (eventsQuery.data ?? []).some((r) => r.eventTitle === ev.title);
                    return (
                      <div key={ev.title} className="p-4 border border-[#ECECF1] rounded">
                        <h4 className="font-medium text-[#3E3D44] text-sm">{ev.title}</h4>
                        <p className="text-[#828297] text-xs mt-1">{ev.date} • {ev.loc}</p>
                        <div className="mt-3">
                          {isRegistered ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">
                              <CheckCircle className="w-3.5 h-3.5" /> Registered
                            </span>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => registerEventMutation.mutate({ eventTitle: ev.title, eventDate: ev.date, location: ev.loc })}
                              disabled={registerEventMutation.isPending}
                              className="bg-[#44407A] hover:bg-[#34305c] text-white text-xs"
                            >
                              Register Now
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Member Directory & Outreach Matcher */}
          <div className="mt-12 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-6 h-6 text-[#A20E56]" />
              <h2 className="text-3xl text-[#3E3D44]">Member Directory & Outreach Matcher</h2>
            </div>
            <p className="text-[#828297] text-sm mb-8">
              Connect with fellow creators. For example: need songwriters in Nashville? Filter below or reach out to coordinate collaborations.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <label className="grid gap-1 text-xs font-medium text-[#3E3D44]">
                Filter by Region
                <Input value={searchRegion === "all" ? "" : searchRegion} onChange={(e) => setSearchRegion(e.target.value || "all")} placeholder="e.g. Nashville, London" />
              </label>
              <label className="grid gap-1 text-xs font-medium text-[#3E3D44]">
                Filter by Category
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="h-10 rounded border border-[#D9D8E1] bg-white px-3 text-sm"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-medium text-[#3E3D44]">
                Filter by Interest
                <select
                  value={searchInterest}
                  onChange={(e) => setSearchInterest(e.target.value)}
                  className="h-10 rounded border border-[#D9D8E1] bg-white px-3 text-sm"
                >
                  <option value="all">All Interests</option>
                  {INTEREST_OPTIONS.map((opt) => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-medium text-[#3E3D44]">
                Search Keyword
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-[#828297]" />
                  <Input value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} placeholder="Name, role, company..." className="pl-9" />
                </div>
              </label>
            </div>

            {directoryQuery.isLoading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#A20E56]" />
              </div>
            ) : (directoryQuery.data ?? []).length === 0 ? (
              <div className="text-center py-12 text-[#828297]">No members found matching your filters.</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(directoryQuery.data ?? []).map((m) => (
                  <div key={m.id} className="p-6 border border-[#ECECF1] rounded flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs uppercase tracking-wider font-semibold text-[#A20E56] bg-[#A20E56]/10 px-2 py-0.5 rounded">
                          {m.categoryType}
                        </span>
                        <span className="text-xs text-[#828297] flex items-center gap-1">
                          <Globe className="w-3 h-3" /> {m.region}
                        </span>
                      </div>
                      <h4 className="text-xl font-display text-[#44407A] mb-1">{m.fullName}</h4>
                      <p className="text-sm font-medium text-[#3E3D44] mb-2">{m.careerRole} {m.company ? `@ ${m.company}` : ""}</p>
                      {m.bio && <p className="text-xs text-[#828297] line-clamp-3 mb-4">{m.bio}</p>}
                    </div>
                    <a
                      href="mailto:info@sheisthemusic.org"
                      className="inline-flex items-center justify-center w-full bg-[#ECECF1] hover:bg-[#44407A] hover:text-white text-[#3E3D44] text-xs font-semibold uppercase tracking-wider py-2 rounded transition-colors"
                    >
                      Connect via SITM
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}