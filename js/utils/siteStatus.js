export function deriveStatus(site) {
  const contract = site.acq && site.acq.contract_date;
  const fac = site.acceptance && site.acceptance.fac === true;
  if (contract && fac) return 'Complete';

  const anyFilled = [site.acq, site.sta, site.construction, site.acceptance].some(
    (sec) => sec && Object.values(sec).some((v) => (typeof v === 'boolean' ? v === true : !!v))
  );
  if (contract || anyFilled) return 'In progress';

  return 'New';
}
