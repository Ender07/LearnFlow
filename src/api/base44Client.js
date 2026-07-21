// Custom Base44 Mock/Offline Client mapping to localStorage
import { seedDatabase } from './dbSeeder';

const getStore = (key) => {
  const data = localStorage.getItem(`lf_${key}`);
  if (!data) {
    const seeded = seedDatabase(key);
    localStorage.setItem(`lf_${key}`, JSON.stringify(seeded));
    return seeded;
  }
  return JSON.parse(data);
};

const setStore = (key, data) => {
  localStorage.setItem(`lf_${key}`, JSON.stringify(data));
};

// Check if a default user is logged in, otherwise set default operator
if (!localStorage.getItem('lf_current_user')) {
  localStorage.setItem('lf_current_user', JSON.stringify({
    id: 'usr-operator',
    full_name: 'John Doe',
    email: 'john.doe@learnflow.industrial',
    role: 'user'
  }));
}

export const base44 = {
  db: new Proxy({}, {
    get: (_, entityName) => ({
      list: async (sortKey, limit) => {
        let items = getStore(entityName);
        if (sortKey) {
          const desc = sortKey.startsWith('-');
          const prop = desc ? sortKey.substring(1) : sortKey;
          items.sort((a, b) => {
            if (a[prop] < b[prop]) return desc ? 1 : -1;
            if (a[prop] > b[prop]) return desc ? -1 : 1;
            return 0;
          });
        }
        if (limit) {
          items = items.slice(0, limit);
        }
        return items;
      },
      filter: async (filters) => {
        const items = getStore(entityName);
        return items.filter(item => 
          Object.entries(filters).every(([k, v]) => item[k] === v)
        );
      },
      get: async (id) => {
        const items = getStore(entityName);
        return items.find(i => i.id === id) || null;
      },
      create: async (data) => {
        const items = getStore(entityName);
        const newItem = { 
          id: `${entityName.toLowerCase().substring(0, 4)}_${Math.random().toString(36).substr(2, 9)}`, 
          created_date: new Date().toISOString(), 
          updated_date: new Date().toISOString(),
          ...data 
        };
        items.push(newItem);
        setStore(entityName, items);
        return newItem;
      },
      update: async (id, data) => {
        const items = getStore(entityName);
        const index = items.findIndex(i => i.id === id);
        if (index === -1) {
          // Try mapping by code key (e.g. process_id)
          const fallbackIndex = items.findIndex(i => i.process_id === id);
          if (fallbackIndex !== -1) {
            items[fallbackIndex] = { ...items[fallbackIndex], ...data, updated_date: new Date().toISOString() };
            setStore(entityName, items);
            return items[fallbackIndex];
          }
          // If totally missing, insert as new
          const created = { id, created_date: new Date().toISOString(), ...data };
          items.push(created);
          setStore(entityName, items);
          return created;
        }
        items[index] = { ...items[index], ...data, updated_date: new Date().toISOString() };
        setStore(entityName, items);
        return items[index];
      },
      delete: async (id) => {
        const items = getStore(entityName);
        const filtered = items.filter(i => i.id !== id);
        setStore(entityName, filtered);
        return { success: true };
      }
    })
  }),
  auth: {
    me: async () => {
      const u = localStorage.getItem('lf_current_user');
      return u ? JSON.parse(u) : null;
    },
    logout: async () => {
      localStorage.removeItem('lf_current_user');
      window.location.reload();
    },
    redirectToLogin: () => {
      window.location.href = '/login';
    }
  }
};
