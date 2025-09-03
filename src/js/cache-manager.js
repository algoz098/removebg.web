// Sistema de cache inteligente
import { formatFileSize } from './utils.js';

export class CacheManager {
  constructor() {
    this.dbName = 'RemoveBGCache';
    this.dbVersion = 2;
    this.storeName = 'aiResources';
    this.db = null;
    this.cacheExpiry = 7 * 24 * 60 * 60 * 1000; // 7 dias
  }

  /**
   * Inicializa o banco IndexedDB
   */
  async initDB() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Deletar store antiga se existir
        if (db.objectStoreNames.contains(this.storeName)) {
          db.deleteObjectStore(this.storeName);
        }

        // Criar nova store
        const store = db.createObjectStore(this.storeName, { keyPath: 'url' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      };
    });
  }

  /**
   * Armazena um recurso no cache
   */
  async cacheResource(url, data, type = 'unknown') {
    try {
      await this.initDB();
      
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const resource = {
        url,
        data,
        type,
        timestamp: Date.now(),
        size: data.byteLength || data.length || 0
      };

      await new Promise((resolve, reject) => {
        const request = store.put(resource);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      console.log(`📦 Recurso cachado: ${url} (${this.formatBytes(resource.size)})`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao cachear recurso:', error);
      return false;
    }
  }

  /**
   * Recupera um recurso do cache
   */
  async getCachedResource(url) {
    try {
      const startTime = Date.now();
      await this.initDB();
      
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const resource = await new Promise((resolve, reject) => {
        const request = store.get(url);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      if (!resource) return null;

      // Verificar se não expirou
      if (Date.now() - resource.timestamp > this.cacheExpiry) {
        await this.deleteCachedResource(url);
        return null;
      }

      const readTime = Date.now() - startTime;
      console.log(`💾 Cache hit: ${url} (${this.formatBytes(resource.size)} em ${readTime}ms - ${this.formatSpeed(resource.size, readTime)})`);

      return resource.data;
    } catch (error) {
      console.error('❌ Erro ao recuperar recurso do cache:', error);
      return null;
    }
  }

  /**
   * Remove um recurso específico do cache
   */
  async deleteCachedResource(url) {
    try {
      await this.initDB();
      
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise((resolve, reject) => {
        const request = store.delete(url);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      console.log(`🗑️ Recurso removido do cache: ${url}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao remover recurso do cache:', error);
      return false;
    }
  }

  /**
   * Limpa recursos expirados
   */
  async cleanExpiredResources() {
    try {
      await this.initDB();
      
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      
      const expiredTime = Date.now() - this.cacheExpiry;
      const range = IDBKeyRange.upperBound(expiredTime);
      
      let deletedCount = 0;
      
      await new Promise((resolve, reject) => {
        const request = index.openCursor(range);
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            deletedCount++;
            cursor.continue();
          } else {
            resolve();
          }
        };
        
        request.onerror = () => reject(request.error);
      });

      if (deletedCount > 0) {
        console.log(`🧹 Limpeza: ${deletedCount} recursos expirados removidos`);
      }
      
      return deletedCount;
    } catch (error) {
      console.error('❌ Erro na limpeza de recursos:', error);
      return 0;
    }
  }

  /**
   * Obtém estatísticas do cache
   */
  async getCacheStats() {
    try {
      await this.initDB();
      
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const resources = await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const totalSize = resources.reduce((sum, resource) => sum + (resource.size || 0), 0);
      const types = {};
      
      resources.forEach(resource => {
        types[resource.type] = (types[resource.type] || 0) + 1;
      });

      return {
        count: resources.length,
        totalSize,
        formattedSize: this.formatBytes(totalSize),
        types
      };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      return { count: 0, totalSize: 0, formattedSize: '0 B', types: {} };
    }
  }

  /**
   * Limpa todo o cache
   */
  async clearCache() {
    try {
      await this.initDB();
      
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      console.log('🗑️ Cache limpo completamente');
      toast.success('Cache limpo com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
      toast.error('Erro ao limpar cache');
      return false;
    }
  }

  /**
   * Formata bytes em formato legível
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Intercepta fetch para cachear recursos automaticamente
   */
  async interceptFetch(url, options = {}) {
    // Primeiro tenta buscar no cache
    const cachedData = await this.getCachedResource(url);
    if (cachedData) {
      console.log(`⚡ Cache hit: ${url}`);
      
      // Retorna Response compatível
      if (cachedData instanceof ArrayBuffer) {
        return new Response(cachedData);
      } else if (typeof cachedData === 'string') {
        return new Response(cachedData);
      } else {
        return new Response(JSON.stringify(cachedData));
      }
    }

    // Se não está no cache, faz fetch normal
    try {
      console.log(`🌐 Cache miss, baixando: ${url}`);
      const response = await fetch(url, options);
      
      if (response.ok) {
        const clone = response.clone();
        
        // Determina o tipo baseado na URL
        let type = 'unknown';
        if (url.includes('.wasm')) type = 'wasm';
        else if (url.includes('.onnx') || url.includes('model')) type = 'model';
        else if (url.includes('.bin') || url.includes('data')) type = 'data';
        else if (url.includes('.js')) type = 'script';
        
        // Cachea o recurso em background
        clone.arrayBuffer().then(buffer => {
          this.cacheResource(url, buffer, type);
        }).catch(err => {
          console.warn('⚠️ Falha ao cachear recurso:', url, err);
        });
      }
      
      return response;
    } catch (error) {
      console.error(`❌ Erro no fetch: ${url}`, error);
      throw error;
    }
  }

  /**
   * Inicialização automática da limpeza
   */
  async init() {
    try {
      await this.initDB();
      
      // Limpeza automática na inicialização
      const deletedCount = await this.cleanExpiredResources();
      
      // Mostrar estatísticas se houver recursos
      const stats = await this.getCacheStats();
      if (stats.count > 0) {
        console.log(`📊 Cache stats: ${stats.count} recursos, ${stats.formattedSize} total`);
        
        // Notificar usuário sobre cache existente
        setTimeout(() => {
          toast.info(`💾 ${stats.count} recursos em cache (${stats.formattedSize})`, 3000);
        }, 2000);
      }
      
    } catch (error) {
      console.error('❌ Erro na inicialização do cache:', error);
    }
  }

  /**
   * Formatar velocidade de transferência
   */
  formatSpeed(bytes, timeMs) {
    if (timeMs === 0) return '-- B/s';
    
    const bytesPerSecond = (bytes / timeMs) * 1000;
    
    if (bytesPerSecond < 1024) {
      return `${bytesPerSecond.toFixed(0)} B/s`;
    } else if (bytesPerSecond < 1024 * 1024) {
      return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
    } else {
      return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
    }
  }
}

// Instância global
export const cacheManager = new CacheManager();
