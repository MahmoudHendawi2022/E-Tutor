import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { masterDataService } from "../services/masterData/masterData.service";

const MasterDataContext = createContext(null);

export function MasterDataProvider({ children }) {
  const [masterData, setMasterData] = useState(() => masterDataService.loadData());

  useEffect(() => {
    masterDataService.saveData(masterData);
  }, [masterData]);

  const addLookup = (key, label) => {
    let success = false;
    setMasterData((current) => {
      const res = masterDataService.addLookup(current, key, label);
      success = res.success;
      return res.data;
    });
    return success;
  };

  const toggleLookup = (key, id) => {
    setMasterData((current) => masterDataService.toggleLookup(current, key, id));
  };

  const addSubject = (label) => {
    let success = false;
    setMasterData((current) => {
      const res = masterDataService.addSubject(current, label);
      success = res.success;
      return res.data;
    });
    return success;
  };

  const toggleSubject = (subjectId) => {
    setMasterData((current) => masterDataService.toggleSubject(current, subjectId));
  };

  const addBranch = (subjectId, label) => {
    let success = false;
    setMasterData((current) => {
      const res = masterDataService.addBranch(current, subjectId, label);
      success = res.success;
      return res.data;
    });
    return success;
  };

  const toggleBranch = (subjectId, branchId) => {
    setMasterData((current) => masterDataService.toggleBranch(current, subjectId, branchId));
  };

  const addCountry = ({ code, label, timezone }) => {
    let success = false;
    setMasterData((current) => {
      const res = masterDataService.addCountry(current, { code, label, timezone });
      success = res.success;
      return res.data;
    });
    return success;
  };

  const toggleCountry = (code) => {
    setMasterData((current) => masterDataService.toggleCountry(current, code));
  };

  const addCity = (countryCode, label) => {
    let success = false;
    setMasterData((current) => {
      const res = masterDataService.addCity(current, countryCode, label);
      success = res.success;
      return res.data;
    });
    return success;
  };

  const toggleCity = (countryCode, cityId) => {
    setMasterData((current) => masterDataService.toggleCity(current, countryCode, cityId));
  };

  const addUniversity = (countryCode, label) => {
    let success = false;
    setMasterData((current) => {
      const res = masterDataService.addUniversity(current, countryCode, label);
      success = res.success;
      return res.data;
    });
    return success;
  };

  const toggleUniversity = (countryCode, universityId) => {
    setMasterData((current) => masterDataService.toggleUniversity(current, countryCode, universityId));
  };

  const getSubjectById = (id) => masterData.subjects.find((item) => item.id === id) || null;
  const getCountryByCode = (code) => masterData.countries.find((item) => item.code === code) || null;

  const active = useMemo(
    () => ({
      professionalTitles: masterData.professionalTitles.filter((item) => item.active),
      subjects: masterData.subjects
        .filter((item) => item.active)
        .map((subject) => ({
          ...subject,
          branches: subject.branches.filter((branch) => branch.active),
        })),
      countries: masterData.countries
        .filter((item) => item.active)
        .map((country) => ({
          ...country,
          cities: country.cities.filter((city) => city.active),
          universities: country.universities.filter((university) => university.active),
        })),
      degrees: masterData.degrees.filter((item) => item.active),
      languages: masterData.languages.filter((item) => item.active),
      teachingLevels: masterData.teachingLevels.filter((item) => item.active),
      currencies: masterData.currencies.filter((item) => item.active),
      priceOptions: masterData.priceOptions,
      experienceOptions: masterData.experienceOptions,
    }),
    [masterData],
  );

  const resetMasterData = () => setMasterData(masterDataService.getSeedData());

  const value = useMemo(
    () => ({
      masterData,
      active,
      getSubjectById,
      getCountryByCode,
      addLookup,
      toggleLookup,
      addSubject,
      toggleSubject,
      addBranch,
      toggleBranch,
      addCountry,
      toggleCountry,
      addCity,
      toggleCity,
      addUniversity,
      toggleUniversity,
      resetMasterData,
    }),
    [masterData, active],
  );

  return <MasterDataContext.Provider value={value}>{children}</MasterDataContext.Provider>;
}

export function useMasterData() {
  const context = useContext(MasterDataContext);
  if (!context) throw new Error("useMasterData must be used inside MasterDataProvider");
  return context;
}
