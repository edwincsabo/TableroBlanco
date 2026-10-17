import {Languages} from 'lucide-react';
import {languages,useLocale,setLocale,t,type Locale} from './i18n';
export default function LanguageSelector({compact=false}:{compact?:boolean}){
  const locale=useLocale();
  return <label className={`language-selector ${compact?'language-compact':''}`}><Languages size={18}/>{!compact&&<span>{t('Idioma de la aplicación')}</span>}<select aria-label={t('Idioma de la aplicación')} value={locale} onChange={e=>setLocale(e.target.value as Locale)}>{languages.map(language=><option key={language.id} value={language.id}>{language.label}</option>)}</select></label>;
}
