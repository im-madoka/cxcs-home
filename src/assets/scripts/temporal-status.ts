const labels: Record<string, string> = {
  upcoming: '即将开始',
  ongoing: '进行中',
  ended: '已结束',
  cancelled: '已取消',
  open: '正在进行',
  closed: '本轮结束',
};

const setStatus = (element: HTMLElement, status: string) => {
  element.dataset.status = status;
  element.classList.remove(
    'status-upcoming',
    'status-ongoing',
    'status-ended',
    'status-cancelled',
    'status-open',
    'status-closed',
  );
  element.classList.add(`status-${status}`);
  const text = Array.from(element.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
  if (text) text.textContent = labels[status] || status;
};

const initTemporalStatus = () => {
  document.querySelectorAll<HTMLElement>('[data-status-pill][data-start][data-end]').forEach((element) => {
    const start = new Date(element.dataset.start || '').getTime();
    const end = new Date(element.dataset.end || '').getTime();
    if (Number.isNaN(start) || Number.isNaN(end)) return;
    const now = Date.now();
    setStatus(
      element,
      element.dataset.cancelled === 'true' ? 'cancelled' : now < start ? 'upcoming' : now < end ? 'ongoing' : 'ended',
    );
  });

  document
    .querySelectorAll<HTMLElement>('[data-status-pill][data-recruitment-start][data-recruitment-end]')
    .forEach((element) => {
      const start = new Date(element.dataset.recruitmentStart || '').getTime();
      const end = new Date(element.dataset.recruitmentEnd || '').getTime();
      if (Number.isNaN(start) || Number.isNaN(end)) return;
      const now = Date.now();
      setStatus(element, now < start ? 'upcoming' : now < end ? 'open' : 'closed');
    });
};

document.addEventListener('astro:page-load', initTemporalStatus);
initTemporalStatus();
