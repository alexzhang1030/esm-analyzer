import type { ASTNodeLocation } from '@/types'

interface ScanResultBase {
  source: string
  loc: ASTNodeLocation
}

export interface ScanImportResultDefault extends ScanResultBase {
  type: 'default'
  local: string // local name
}

export interface ScanImportResultNamespace extends ScanResultBase {
  type: 'namespace'
  local: string // local name
}

export interface ScanImportResultImport extends ScanResultBase {
  type: 'import'
  subType: 'id' | 'string'
  isType: boolean
  local: string // local name
  imported: string // imported name
}

export type ScanImportResultItem = ScanImportResultDefault | ScanImportResultNamespace | ScanImportResultImport
