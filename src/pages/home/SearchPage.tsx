import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FeedCard from '@/components/FeedCard/FeedCard'
import { MOCK_POSTS } from '@/utils/mockData'
import type { MissingPost } from '@/types'
import styles from './SearchPage.module.css'

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
)

const ClearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)

const RECENT_SEARCHES_KEY = 'recentSearches'

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveRecentSearch(keyword: string) {
  const prev = getRecentSearches().filter((k) => k !== keyword)
  const next = [keyword, ...prev].slice(0, 10)
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
}

function removeRecentSearch(keyword: string) {
  const next = getRecentSearches().filter((k) => k !== keyword)
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
}

// 검색 페이지 (NavBar 없음)
export default function SearchPage() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>(getRecentSearches)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const search = (keyword: string) => {
    const trimmed = keyword.trim()
    if (!trimmed) return
    saveRecentSearch(trimmed)
    setRecentSearches(getRecentSearches())
    setQuery(trimmed)
    setSubmittedQuery(trimmed)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    search(query)
  }

  const handleRecentClick = (keyword: string) => {
    setQuery(keyword)
    search(keyword)
  }

  const handleRemoveRecent = (keyword: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeRecentSearch(keyword)
    setRecentSearches(getRecentSearches())
  }

  // 이름, 품종, 위치 기반 검색
  const results: MissingPost[] = submittedQuery
    ? MOCK_POSTS.filter((p) =>
        p.petName.includes(submittedQuery) ||
        p.species.includes(submittedQuery) ||
        p.location.address.includes(submittedQuery),
      )
    : []

  return (
    <div className={styles.page}>
      {/* 검색 헤더 */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="뒤로가기">
          <BackIcon />
        </button>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="search"
            placeholder="고양이 이름, 품종, 지역으로 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.input}
          />
          {query && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => { setQuery(''); setSubmittedQuery('') }}
              aria-label="초기화"
            >
              <ClearIcon />
            </button>
          )}
        </form>
      </header>

      <main className={styles.main}>
        {/* 최근 검색어 (검색 전) */}
        {!submittedQuery && recentSearches.length > 0 && (
          <section className={styles.recentSection}>
            <h2 className={styles.sectionTitle}>최근 검색어</h2>
            <ul className={styles.recentList}>
              {recentSearches.map((keyword) => (
                <li key={keyword} className={styles.recentItem} onClick={() => handleRecentClick(keyword)}>
                  <span className={styles.recentKeyword}>{keyword}</span>
                  <button
                    className={styles.removeBtn}
                    onClick={(e) => handleRemoveRecent(keyword, e)}
                    aria-label="삭제"
                  >
                    <ClearIcon />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 검색 결과 */}
        {submittedQuery && (
          <>
            <div className={styles.resultHeader}>
              <span className={styles.resultCount}>
                "{submittedQuery}" 검색 결과 {results.length}건
              </span>
            </div>
            {results.length > 0 ? (
              <ul className={styles.resultList}>
                {results.map((post) => (
                  <li key={post.id}>
                    <FeedCard post={post} onClick={() => navigate(`/post/${post.id}`)} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>🔍</span>
                <p className={styles.emptyTitle}>검색 결과가 없어요</p>
                <p className={styles.emptyDesc}>다른 이름이나 품종으로 검색해 보세요</p>
              </div>
            )}
          </>
        )}

        {/* 검색어 없고 최근 검색어도 없을 때 */}
        {!submittedQuery && recentSearches.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🐱</span>
            <p className={styles.emptyTitle}>잃어버린 반려동물을 찾아보세요</p>
            <p className={styles.emptyDesc}>이름, 품종, 지역으로 검색할 수 있어요</p>
          </div>
        )}
      </main>
    </div>
  )
}
