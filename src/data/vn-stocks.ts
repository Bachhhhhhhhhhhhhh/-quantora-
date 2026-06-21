/**
 * Vietnamese stock catalog — HOSE/HNX/UPCOM.
 * Yahoo Finance format: SYMBOL.VN (e.g. VNM.VN = Vinamilk)
 * Enables instant local search in Vietnamese + English.
 */

export interface StockCatalogEntry {
  symbol: string       // Yahoo symbol e.g. VNM.VN
  code: string         // Local code e.g. VNM
  name: string
  nameVi: string
  exchange: 'HOSE' | 'HNX' | 'UPCOM'
  sector: string
  sectorVi: string
}

export const VN_STOCKS: StockCatalogEntry[] = [
  { symbol: 'VNM.VN', code: 'VNM', name: 'Vinamilk', nameVi: 'Vinamilk', exchange: 'HOSE', sector: 'Consumer Staples', sectorVi: 'Hàng tiêu dùng' },
  { symbol: 'VIC.VN', code: 'VIC', name: 'Vingroup', nameVi: 'Tập đoàn Vingroup', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bất động sản' },
  { symbol: 'VHM.VN', code: 'VHM', name: 'Vinhomes', nameVi: 'Vinhomes', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bất động sản' },
  { symbol: 'HPG.VN', code: 'HPG', name: 'Hoa Phat Group', nameVi: 'Tập đoàn Hòa Phát', exchange: 'HOSE', sector: 'Materials', sectorVi: 'Vật liệu' },
  { symbol: 'FPT.VN', code: 'FPT', name: 'FPT Corporation', nameVi: 'Tập đoàn FPT', exchange: 'HOSE', sector: 'Technology', sectorVi: 'Công nghệ' },
  { symbol: 'VCB.VN', code: 'VCB', name: 'Vietcombank', nameVi: 'Vietcombank', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Ngân hàng' },
  { symbol: 'BID.VN', code: 'BID', name: 'BIDV', nameVi: 'BIDV', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Ngân hàng' },
  { symbol: 'CTG.VN', code: 'CTG', name: 'VietinBank', nameVi: 'VietinBank', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Ngân hàng' },
  { symbol: 'TCB.VN', code: 'TCB', name: 'Techcombank', nameVi: 'Techcombank', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Ngân hàng' },
  { symbol: 'MBB.VN', code: 'MBB', name: 'MB Bank', nameVi: 'Ngân hàng MB', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Ngân hàng' },
  { symbol: 'VPB.VN', code: 'VPB', name: 'VPBank', nameVi: 'VPBank', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Ngân hàng' },
  { symbol: 'ACB.VN', code: 'ACB', name: 'ACB Bank', nameVi: 'Ngân hàng ACB', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Ngân hàng' },
  { symbol: 'STB.VN', code: 'STB', name: 'Sacombank', nameVi: 'Sacombank', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Ngân hàng' },
  { symbol: 'GAS.VN', code: 'GAS', name: 'PetroVietnam Gas', nameVi: 'PV Gas', exchange: 'HOSE', sector: 'Energy', sectorVi: 'Năng lượng' },
  { symbol: 'PLX.VN', code: 'PLX', name: 'Petrolimex', nameVi: 'Petrolimex', exchange: 'HOSE', sector: 'Energy', sectorVi: 'Năng lượng' },
  { symbol: 'GVR.VN', code: 'GVR', name: 'Vietnam Rubber Group', nameVi: 'Cao su Việt Nam', exchange: 'HOSE', sector: 'Materials', sectorVi: 'Vật liệu' },
  { symbol: 'MWG.VN', code: 'MWG', name: 'Mobile World', nameVi: 'Thế Giới Di Động', exchange: 'HOSE', sector: 'Consumer Discretionary', sectorVi: 'Bán lẻ' },
  { symbol: 'PNJ.VN', code: 'PNJ', name: 'Phu Nhuan Jewelry', nameVi: 'PNJ', exchange: 'HOSE', sector: 'Consumer Discretionary', sectorVi: 'Bán lẻ' },
  { symbol: 'REE.VN', code: 'REE', name: 'Refrigeration Electrical Engineering', nameVi: 'REE', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Công nghiệp' },
  { symbol: 'SAB.VN', code: 'SAB', name: 'Sabeco', nameVi: 'Sabeco', exchange: 'HOSE', sector: 'Consumer Staples', sectorVi: 'Hàng tiêu dùng' },
  { symbol: 'MSN.VN', code: 'MSN', name: 'Masan Group', nameVi: 'Tập đoàn Masan', exchange: 'HOSE', sector: 'Consumer Staples', sectorVi: 'Hàng tiêu dùng' },
  { symbol: 'VJC.VN', code: 'VJC', name: 'VietJet Air', nameVi: 'VietJet Air', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Hàng không' },
  { symbol: 'VRE.VN', code: 'VRE', name: 'Vincom Retail', nameVi: 'Vincom Retail', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bán lẻ BĐS' },
  { symbol: 'SSI.VN', code: 'SSI', name: 'SSI Securities', nameVi: 'Chứng khoán SSI', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Chứng khoán' },
  { symbol: 'VND.VN', code: 'VND', name: 'VNDirect Securities', nameVi: 'VNDirect', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Chứng khoán' },
  { symbol: 'HCM.VN', code: 'HCM', name: 'Ho Chi Minh Securities', nameVi: 'Chứng khoán HCM', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Chứng khoán' },
  { symbol: 'BVH.VN', code: 'BVH', name: 'Bao Viet Holdings', nameVi: 'Bảo Việt', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Bảo hiểm' },
  { symbol: 'POW.VN', code: 'POW', name: 'PetroVietnam Power', nameVi: 'PV Power', exchange: 'HOSE', sector: 'Utilities', sectorVi: 'Điện lực' },
  { symbol: 'DHG.VN', code: 'DHG', name: 'DHG Pharma', nameVi: 'DHG Pharma', exchange: 'HOSE', sector: 'Healthcare', sectorVi: 'Dược phẩm' },
  { symbol: 'DGC.VN', code: 'DGC', name: 'Duc Giang Chemicals', nameVi: 'Hóa chất Đức Giang', exchange: 'HOSE', sector: 'Materials', sectorVi: 'Hóa chất' },
  { symbol: 'KBC.VN', code: 'KBC', name: 'Kinh Bac City Development', nameVi: 'Kinh Bắc', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Khu công nghiệp' },
  { symbol: 'BCM.VN', code: 'BCM', name: 'Becamex IDC', nameVi: 'Becamex', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Khu công nghiệp' },
  { symbol: 'NVL.VN', code: 'NVL', name: 'Novaland', nameVi: 'Novaland', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bất động sản' },
  { symbol: 'PDR.VN', code: 'PDR', name: 'Phat Dat Real Estate', nameVi: 'Phát Đạt', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bất động sản' },
  { symbol: 'DIG.VN', code: 'DIG', name: 'Development Investment Construction', nameVi: 'DIC Corp', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bất động sản' },
  { symbol: 'HSG.VN', code: 'HSG', name: 'Hoa Sen Group', nameVi: 'Tôn Hoa Sen', exchange: 'HOSE', sector: 'Materials', sectorVi: 'Vật liệu' },
  { symbol: 'NKG.VN', code: 'NKG', name: 'Nam Kim Steel', nameVi: 'Thép Nam Kim', exchange: 'HOSE', sector: 'Materials', sectorVi: 'Thép' },
  { symbol: 'VGC.VN', code: 'VGC', name: 'Viglacera Corporation', nameVi: 'Viglacera', exchange: 'HOSE', sector: 'Materials', sectorVi: 'Vật liệu' },
  { symbol: 'VPI.VN', code: 'VPI', name: 'Van Phu Invest', nameVi: 'Văn Phú Invest', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bất động sản' },
  { symbol: 'VIB.VN', code: 'VIB', name: 'VIB Bank', nameVi: 'Ngân hàng VIB', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Ngân hàng' },
  { symbol: 'LPB.VN', code: 'LPB', name: 'LienVietPostBank', nameVi: 'LienVietPostBank', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Ngân hàng' },
  { symbol: 'SHB.VN', code: 'SHB', name: 'SHB Bank', nameVi: 'Ngân hàng SHB', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Ngân hàng' },
  { symbol: 'VCI.VN', code: 'VCI', name: 'Viet Capital Securities', nameVi: 'Vietcap', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Chứng khoán' },
  { symbol: 'VIX.VN', code: 'VIX', name: 'VIX Securities', nameVi: 'VIX', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Chứng khoán' },
  { symbol: 'VGS.VN', code: 'VGS', name: 'Vietnam Steel Corp', nameVi: 'Thép Việt Nam', exchange: 'HNX', sector: 'Materials', sectorVi: 'Thép' },
  { symbol: 'CEO.VN', code: 'CEO', name: 'Cao Su Kon Tum', nameVi: 'Cao su Kon Tum', exchange: 'HNX', sector: 'Materials', sectorVi: 'Cao su' },
  { symbol: 'VCG.VN', code: 'VCG', name: 'Vietnam Construction', nameVi: 'Vinaconex', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Xây dựng' },
  { symbol: 'HDB.VN', code: 'HDB', name: 'HDBank', nameVi: 'HDBank', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Ngân hàng' },
  { symbol: 'TPB.VN', code: 'TPB', name: 'TPBank', nameVi: 'TPBank', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Ngân hàng' },
  { symbol: 'OCB.VN', code: 'OCB', name: 'OCB Bank', nameVi: 'Ngân hàng OCB', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Ngân hàng' },
  { symbol: 'EIB.VN', code: 'EIB', name: 'Eximbank', nameVi: 'Eximbank', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Ngân hàng' },
  { symbol: 'VTP.VN', code: 'VTP', name: 'Viettel Post', nameVi: 'Viettel Post', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Logistics' },
  { symbol: 'GMD.VN', code: 'GMD', name: 'Gemadept', nameVi: 'Gemadept', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Cảng biển' },
  { symbol: 'HAH.VN', code: 'HAH', name: 'Hai An Transport', nameVi: 'Hải An', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Vận tải' },
  { symbol: 'DPM.VN', code: 'DPM', name: 'PetroVietnam Fertilizer', nameVi: 'Đạm Phú Mỹ', exchange: 'HOSE', sector: 'Materials', sectorVi: 'Phân bón' },
  { symbol: 'DCM.VN', code: 'DCM', name: 'Ca Mau Fertilizer', nameVi: 'Đạm Cà Mau', exchange: 'HOSE', sector: 'Materials', sectorVi: 'Phân bón' },
  { symbol: 'VHC.VN', code: 'VHC', name: 'Vinh Hoan Corp', nameVi: 'Vĩnh Hoàn', exchange: 'HOSE', sector: 'Consumer Staples', sectorVi: 'Thủy sản' },
  { symbol: 'ANV.VN', code: 'ANV', name: 'Nam Viet Corp', nameVi: 'Nam Việt', exchange: 'HOSE', sector: 'Consumer Staples', sectorVi: 'Thủy sản' },
  { symbol: 'FRT.VN', code: 'FRT', name: 'FPT Retail', nameVi: 'FPT Retail', exchange: 'HOSE', sector: 'Consumer Discretionary', sectorVi: 'Bán lẻ' },
  { symbol: 'CMG.VN', code: 'CMG', name: 'CMC Corp', nameVi: 'CMC Corp', exchange: 'HOSE', sector: 'Technology', sectorVi: 'Công nghệ' },
  { symbol: 'CTR.VN', code: 'CTR', name: 'Viettel Construction', nameVi: 'Viettel Construction', exchange: 'HOSE', sector: 'Technology', sectorVi: 'Viễn thông' },
  { symbol: 'VGI.VN', code: 'VGI', name: 'Viettel Global Investment', nameVi: 'Viettel Global', exchange: 'HOSE', sector: 'Technology', sectorVi: 'Công nghệ' },
  // — Extended catalog (150+ tickers) —
  { symbol: 'AAA.VN', code: 'AAA', name: 'An Phat Bioplastics', nameVi: 'An Phát Xanh', exchange: 'HOSE', sector: 'Materials', sectorVi: 'Nhựa sinh học' },
  { symbol: 'ACV.VN', code: 'ACV', name: 'Airports Corporation of Vietnam', nameVi: 'ACV Sân bay', exchange: 'UPCOM', sector: 'Industrials', sectorVi: 'Hàng không' },
  { symbol: 'AGG.VN', code: 'AGG', name: 'An Giang Investment', nameVi: 'An Gia', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bất động sản' },
  { symbol: 'APH.VN', code: 'APH', name: 'An Phat Holdings', nameVi: 'An Phát Holdings', exchange: 'HOSE', sector: 'Materials', sectorVi: 'Nhựa' },
  { symbol: 'ASM.VN', code: 'ASM', name: 'Sao Mai Group', nameVi: 'Sao Mai', exchange: 'HOSE', sector: 'Consumer Staples', sectorVi: 'Thủy sản' },
  { symbol: 'BAF.VN', code: 'BAF', name: 'BAF Vietnam Agriculture', nameVi: 'BAF Nông nghiệp', exchange: 'HOSE', sector: 'Consumer Staples', sectorVi: 'Nông nghiệp' },
  { symbol: 'BMP.VN', code: 'BMP', name: 'Binh Minh Plastics', nameVi: 'Bình Minh Plastics', exchange: 'HOSE', sector: 'Materials', sectorVi: 'Nhựa' },
  { symbol: 'BSI.VN', code: 'BSI', name: 'Bao Son Securities', nameVi: 'Bảo Sơn Securities', exchange: 'HNX', sector: 'Financials', sectorVi: 'Chứng khoán' },
  { symbol: 'BWE.VN', code: 'BWE', name: 'Binh Duong Water', nameVi: 'Cấp nước Bình Dương', exchange: 'HOSE', sector: 'Utilities', sectorVi: 'Cấp nước' },
  { symbol: 'CII.VN', code: 'CII', name: 'Ho Chi Minh City Infrastructure', nameVi: 'CII', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Hạ tầng' },
  { symbol: 'CRE.VN', code: 'CRE', name: 'Century Land', nameVi: 'Century Land', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bất động sản' },
  { symbol: 'CSV.VN', code: 'CSV', name: 'South Basic Chemicals', nameVi: 'Hóa chất Cơ bản Miền Nam', exchange: 'HOSE', sector: 'Materials', sectorVi: 'Hóa chất' },
  { symbol: 'CTD.VN', code: 'CTD', name: 'Coteccons Construction', nameVi: 'Coteccons', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Xây dựng' },
  { symbol: 'CTS.VN', code: 'CTS', name: 'VietinBank Securities', nameVi: 'VietinBank Securities', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Chứng khoán' },
  { symbol: 'DBC.VN', code: 'DBC', name: 'Dabaco Group', nameVi: 'Dabaco', exchange: 'HOSE', sector: 'Consumer Staples', sectorVi: 'Chăn nuôi' },
  { symbol: 'DCL.VN', code: 'DCL', name: 'Domesco Medical Import', nameVi: 'Domesco', exchange: 'HOSE', sector: 'Healthcare', sectorVi: 'Dược phẩm' },
  { symbol: 'DGW.VN', code: 'DGW', name: 'Digiworld', nameVi: 'Digiworld', exchange: 'HOSE', sector: 'Technology', sectorVi: 'Phân phối IT' },
  { symbol: 'DHC.VN', code: 'DHC', name: 'Dong Hai JSC', nameVi: 'Đông Hải', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Công nghiệp' },
  { symbol: 'DPR.VN', code: 'DPR', name: 'Dong Phu Rubber', nameVi: 'Cao su Đồng Phú', exchange: 'HOSE', sector: 'Materials', sectorVi: 'Cao su' },
  { symbol: 'DRC.VN', code: 'DRC', name: 'Danang Rubber', nameVi: 'Cao su Đà Nẵng', exchange: 'HOSE', sector: 'Materials', sectorVi: 'Cao su' },
  { symbol: 'DXG.VN', code: 'DXG', name: 'Dat Xanh Group', nameVi: 'Đất Xanh', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bất động sản' },
  { symbol: 'DXS.VN', code: 'DXS', name: 'Dat Xanh Services', nameVi: 'Đất Xanh Services', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Môi giới BĐS' },
  { symbol: 'EVE.VN', code: 'EVE', name: 'Everpia', nameVi: 'Everpia', exchange: 'HOSE', sector: 'Consumer Discretionary', sectorVi: 'Nệm' },
  { symbol: 'FCN.VN', code: 'FCN', name: 'Fecon', nameVi: 'Fecon', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Xây dựng' },
  { symbol: 'FMC.VN', code: 'FMC', name: 'Foods Joint Stock Company', nameVi: 'FMC', exchange: 'HOSE', sector: 'Consumer Staples', sectorVi: 'Thủy sản' },
  { symbol: 'FOX.VN', code: 'FOX', name: 'FPT Telecom', nameVi: 'FPT Telecom', exchange: 'HOSE', sector: 'Technology', sectorVi: 'Viễn thông' },
  { symbol: 'GEX.VN', code: 'GEX', name: 'Gelex Group', nameVi: 'Gelex', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Điện công nghiệp' },
  { symbol: 'GIL.VN', code: 'GIL', name: 'Binh Thanh Import Export', nameVi: 'GIL', exchange: 'HOSE', sector: 'Consumer Discretionary', sectorVi: 'May mặc' },
  { symbol: 'HAG.VN', code: 'HAG', name: 'Hoang Anh Gia Lai', nameVi: 'Hoàng Anh Gia Lai', exchange: 'HOSE', sector: 'Consumer Staples', sectorVi: 'Nông nghiệp' },
  { symbol: 'HAX.VN', code: 'HAX', name: 'Hang Xanh Motors', nameVi: 'Hàng Xanh', exchange: 'HOSE', sector: 'Consumer Discretionary', sectorVi: 'Ô tô' },
  { symbol: 'HDC.VN', code: 'HDC', name: 'Becamex IDC Housing', nameVi: 'HDC', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bất động sản' },
  { symbol: 'HDG.VN', code: 'HDG', name: 'Ha Do Group', nameVi: 'Hà Đô', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bất động sản' },
  { symbol: 'HHS.VN', code: 'HHS', name: 'Hoang Huy Investment', nameVi: 'Hoàng Huy', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bất động sản' },
  { symbol: 'HNG.VN', code: 'HNG', name: 'Hoang Ngoc Gia Lai', nameVi: 'Hoàng Ngọc Gia Lai', exchange: 'HOSE', sector: 'Consumer Staples', sectorVi: 'Nông nghiệp' },
  { symbol: 'HQC.VN', code: 'HQC', name: 'Hoang Quan Consulting', nameVi: 'Hoàng Quân', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bất động sản' },
  { symbol: 'HT1.VN', code: 'HT1', name: 'Ha Tien 1 Cement', nameVi: 'Xi măng Hà Tiên 1', exchange: 'HOSE', sector: 'Materials', sectorVi: 'Xi măng' },
  { symbol: 'HTI.VN', code: 'HTI', name: 'IDICO Infrastructure', nameVi: 'IDICO', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Khu công nghiệp' },
  { symbol: 'HVN.VN', code: 'HVN', name: 'Vietnam Airlines', nameVi: 'Vietnam Airlines', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Hàng không' },
  { symbol: 'IDI.VN', code: 'IDI', name: 'IDI Corporation', nameVi: 'IDI', exchange: 'HOSE', sector: 'Consumer Staples', sectorVi: 'Thủy sản' },
  { symbol: 'IJC.VN', code: 'IJC', name: 'Beijing Investment', nameVi: 'Becamex IDC IJC', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Khu công nghiệp' },
  { symbol: 'IMP.VN', code: 'IMP', name: 'Imexpharm', nameVi: 'Imexpharm', exchange: 'HOSE', sector: 'Healthcare', sectorVi: 'Dược phẩm' },
  { symbol: 'KDC.VN', code: 'KDC', name: 'Kido Group', nameVi: 'Kido', exchange: 'HOSE', sector: 'Consumer Staples', sectorVi: 'Thực phẩm' },
  { symbol: 'KDH.VN', code: 'KDH', name: 'Khang Dien House', nameVi: 'Khang Điền', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bất động sản' },
  { symbol: 'KOS.VN', code: 'KOS', name: 'KOSY', nameVi: 'KOSY', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bất động sản' },
  { symbol: 'LGC.VN', code: 'LGC', name: 'CII Logistics', nameVi: 'CII Logistics', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Logistics' },
  { symbol: 'LHG.VN', code: 'LHG', name: 'Long Hau Corporation', nameVi: 'Long Hậu', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Khu công nghiệp' },
  { symbol: 'LIX.VN', code: 'LIX', name: 'Lix Detergent', nameVi: 'Lix', exchange: 'HOSE', sector: 'Consumer Staples', sectorVi: 'Hóa mỹ phẩm' },
  { symbol: 'MCH.VN', code: 'MCH', name: 'Masan Consumer', nameVi: 'Masan Consumer', exchange: 'UPCOM', sector: 'Consumer Staples', sectorVi: 'Tiêu dùng' },
  { symbol: 'MCP.VN', code: 'MCP', name: 'Mekong Capital', nameVi: 'Mekong Capital', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Đầu tư' },
  { symbol: 'MHC.VN', code: 'MHC', name: 'MHC', nameVi: 'MHC', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Logistics' },
  { symbol: 'MSB.VN', code: 'MSB', name: 'Maritime Bank', nameVi: 'MSB', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Ngân hàng' },
  { symbol: 'NAB.VN', code: 'NAB', name: 'Nam A Bank', nameVi: 'Nam A Bank', exchange: 'UPCOM', sector: 'Financials', sectorVi: 'Ngân hàng' },
  { symbol: 'NBB.VN', code: 'NBB', name: '577 Investment', nameVi: '577', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bất động sản' },
  { symbol: 'NCT.VN', code: 'NCT', name: 'Noi Bai Cargo Terminal', nameVi: 'NCT', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Hàng không' },
  { symbol: 'NET.VN', code: 'NET', name: 'Net Detergent', nameVi: 'NET', exchange: 'HOSE', sector: 'Consumer Staples', sectorVi: 'Hóa mỹ phẩm' },
  { symbol: 'NLG.VN', code: 'NLG', name: 'Nam Long Investment', nameVi: 'Nam Long', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bất động sản' },
  { symbol: 'NT2.VN', code: 'NT2', name: 'Nam Theun 2 Power', nameVi: 'NT2', exchange: 'HOSE', sector: 'Utilities', sectorVi: 'Điện lực' },
  { symbol: 'NVU.VN', code: 'NVU', name: 'Novaland Urban', nameVi: 'Novaland Urban', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bất động sản' },
  { symbol: 'ORS.VN', code: 'ORS', name: 'Tien Phong Securities', nameVi: 'TPS', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Chứng khoán' },
  { symbol: 'PAN.VN', code: 'PAN', name: 'PAN Group', nameVi: 'PAN Group', exchange: 'HOSE', sector: 'Consumer Staples', sectorVi: 'Nông nghiệp' },
  { symbol: 'PC1.VN', code: 'PC1', name: 'Power Construction', nameVi: 'PC1', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Xây lắp điện' },
  { symbol: 'PET.VN', code: 'PET', name: 'PetroVietnam General Services', nameVi: 'Petrolimex PET', exchange: 'HOSE', sector: 'Energy', sectorVi: 'Dầu khí' },
  { symbol: 'PHR.VN', code: 'PHR', name: 'Phuoc Hoa Rubber', nameVi: 'Cao su Phước Hòa', exchange: 'HOSE', sector: 'Materials', sectorVi: 'Cao su' },
  { symbol: 'PPC.VN', code: 'PPC', name: 'Pha Lai Thermal Power', nameVi: 'Nhiệt điện Phả Lại', exchange: 'HOSE', sector: 'Utilities', sectorVi: 'Điện lực' },
  { symbol: 'PTB.VN', code: 'PTB', name: 'Phu Tho Pharmaceutical', nameVi: 'Dược Phú Thọ', exchange: 'HOSE', sector: 'Healthcare', sectorVi: 'Dược phẩm' },
  { symbol: 'PVD.VN', code: 'PVD', name: 'PetroVietnam Drilling', nameVi: 'PVD Khoan', exchange: 'HOSE', sector: 'Energy', sectorVi: 'Dầu khí' },
  { symbol: 'PVT.VN', code: 'PVT', name: 'PetroVietnam Transport', nameVi: 'PVT Vận tải', exchange: 'HOSE', sector: 'Energy', sectorVi: 'Dầu khí' },
  { symbol: 'QCG.VN', code: 'QCG', name: 'Quoc Cuong Gia Lai', nameVi: 'Quốc Cường Gia Lai', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bất động sản' },
  { symbol: 'RAL.VN', code: 'RAL', name: 'Rang Dong Light Source', nameVi: 'Rạng Đông', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Điện tử' },
  { symbol: 'SCR.VN', code: 'SCR', name: 'Saigon Construction', nameVi: 'SCR', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bất động sản' },
  { symbol: 'SCS.VN', code: 'SCS', name: 'Saigon Cargo Service', nameVi: 'SCS', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Hàng không' },
  { symbol: 'SFC.VN', code: 'SFC', name: 'Saigon Fuel', nameVi: 'Saigon Fuel', exchange: 'HOSE', sector: 'Energy', sectorVi: 'Xăng dầu' },
  { symbol: 'SGN.VN', code: 'SGN', name: 'Saigon Ground Services', nameVi: 'SAGS', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Hàng không' },
  { symbol: 'SGR.VN', code: 'SGR', name: 'Saigon Real Estate', nameVi: 'SGR', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bất động sản' },
  { symbol: 'SHI.VN', code: 'SHI', name: 'Son Ha International', nameVi: 'Sơn Hà', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Công nghiệp' },
  { symbol: 'SIP.VN', code: 'SIP', name: 'Saigon VRG', nameVi: 'SIP', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Khu công nghiệp' },
  { symbol: 'SJS.VN', code: 'SJS', name: 'Song Da Urban', nameVi: 'SJS', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bất động sản' },
  { symbol: 'SKG.VN', code: 'SKG', name: 'Superdong Speed Boat', nameVi: 'Superdong', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Vận tải' },
  { symbol: 'SMC.VN', code: 'SMC', name: 'SMC Trading Investment', nameVi: 'SMC', exchange: 'HOSE', sector: 'Materials', sectorVi: 'Thép' },
  { symbol: 'SPM.VN', code: 'SPM', name: 'SPM', nameVi: 'SPM', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Công nghiệp' },
  { symbol: 'SSB.VN', code: 'SSB', name: 'SeABank', nameVi: 'SeABank', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Ngân hàng' },
  { symbol: 'STG.VN', code: 'STG', name: 'South Logistics', nameVi: 'Giao nhận Miền Nam', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Logistics' },
  { symbol: 'STK.VN', code: 'STK', name: 'Century Synthetic Fiber', nameVi: 'Sợi Century', exchange: 'HOSE', sector: 'Materials', sectorVi: 'Sợi' },
  { symbol: 'SZC.VN', code: 'SZC', name: 'Sonadezi Chau Duc', nameVi: 'Sonadezi Châu Đức', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Khu công nghiệp' },
  { symbol: 'TCH.VN', code: 'TCH', name: 'Hoang Huy Transport', nameVi: 'TCH Vận tải', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Vận tải' },
  { symbol: 'TDH.VN', code: 'TDH', name: 'Thu Duc Housing', nameVi: 'Thủ Đức House', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bất động sản' },
  { symbol: 'TDM.VN', code: 'TDM', name: 'Thuduc Water', nameVi: 'Cấp nước Thủ Đức', exchange: 'HOSE', sector: 'Utilities', sectorVi: 'Cấp nước' },
  { symbol: 'TLG.VN', code: 'TLG', name: 'Thien Long Group', nameVi: 'Thiên Long', exchange: 'HOSE', sector: 'Consumer Discretionary', sectorVi: 'Văn phòng phẩm' },
  { symbol: 'TNH.VN', code: 'TNH', name: 'TNH Hospital', nameVi: 'Bệnh viện TNH', exchange: 'HOSE', sector: 'Healthcare', sectorVi: 'Y tế' },
  { symbol: 'TPH.VN', code: 'TPH', name: 'Tan Phu Viet Nam', nameVi: 'Tân Phú', exchange: 'HOSE', sector: 'Materials', sectorVi: 'Thép' },
  { symbol: 'TRA.VN', code: 'TRA', name: 'Traphaco', nameVi: 'Traphaco', exchange: 'HOSE', sector: 'Healthcare', sectorVi: 'Dược phẩm' },
  { symbol: 'TV2.VN', code: 'TV2', name: 'Power Engineering Consulting 2', nameVi: 'TV2', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Tư vấn điện' },
  { symbol: 'TVB.VN', code: 'TVB', name: 'Tri Viet Securities', nameVi: 'Tri Việt', exchange: 'HOSE', sector: 'Financials', sectorVi: 'Chứng khoán' },
  { symbol: 'VAF.VN', code: 'VAF', name: 'Vinafco', nameVi: 'Vinafco', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Logistics' },
  { symbol: 'VCA.VN', code: 'VCA', name: 'Vinacafe Bien Hoa', nameVi: 'Vinacafe', exchange: 'HOSE', sector: 'Consumer Staples', sectorVi: 'Cà phê' },
  { symbol: 'VCS.VN', code: 'VCS', name: 'Vietnam Container Shipping', nameVi: 'Viconship', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Cảng biển' },
  { symbol: 'VFG.VN', code: 'VFG', name: 'Vietnam Fumigation', nameVi: 'VFG', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Dịch vụ' },
  { symbol: 'VGT.VN', code: 'VGT', name: 'Vietnam Garment', nameVi: 'May 10', exchange: 'HOSE', sector: 'Consumer Discretionary', sectorVi: 'May mặc' },
  { symbol: 'VHG.VN', code: 'VHG', name: 'Vinh Hoang Group', nameVi: 'Vinh Hoang', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bất động sản' },
  { symbol: 'VHR.VN', code: 'VHR', name: 'Vinpearl', nameVi: 'Vinpearl', exchange: 'HOSE', sector: 'Consumer Discretionary', sectorVi: 'Du lịch' },
  { symbol: 'VNE.VN', code: 'VNE', name: 'Vietnam Expressway', nameVi: 'VEC', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Hạ tầng' },
  { symbol: 'VNL.VN', code: 'VNL', name: 'Vinaconex Land', nameVi: 'Vinaconex Land', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bất động sản' },
  { symbol: 'VNS.VN', code: 'VNS', name: 'Vietnam Sun', nameVi: 'Vietnam Sun', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Du lịch' },
  { symbol: 'VOS.VN', code: 'VOS', name: 'Vietnam Ocean Shipping', nameVi: 'VOSCO', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Cảng biển' },
  { symbol: 'VPG.VN', code: 'VPG', name: 'Viet Phat Import Export', nameVi: 'Việt Phát', exchange: 'HOSE', sector: 'Consumer Discretionary', sectorVi: 'Bán lẻ' },
  { symbol: 'VRC.VN', code: 'VRC', name: 'Vincom Real Estate', nameVi: 'Vincom', exchange: 'HOSE', sector: 'Real Estate', sectorVi: 'Bất động sản' },
  { symbol: 'VSC.VN', code: 'VSC', name: 'Vietnam Container Terminals', nameVi: 'VSC', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Cảng biển' },
  { symbol: 'VSH.VN', code: 'VSH', name: 'Vinh Son Son La Hydropower', nameVi: 'VSH Thủy điện', exchange: 'HOSE', sector: 'Utilities', sectorVi: 'Thủy điện' },
  { symbol: 'VTO.VN', code: 'VTO', name: 'Vietnam Tanker', nameVi: 'Vietnam Tanker', exchange: 'HOSE', sector: 'Industrials', sectorVi: 'Vận tải' },
  { symbol: 'YEG.VN', code: 'YEG', name: 'Yeah1 Group', nameVi: 'Yeah1', exchange: 'HOSE', sector: 'Technology', sectorVi: 'Truyền thông' },
]

const vnIndex = new Map<string, StockCatalogEntry>()
for (const s of VN_STOCKS) {
  vnIndex.set(s.code.toLowerCase(), s)
  vnIndex.set(s.symbol.toLowerCase(), s)
}

export function searchVNStocks(query: string): StockCatalogEntry[] {
  if (!query) return []
  const q = query.trim().toLowerCase()
  if (!q) return []

  // Exact code match first
  if (vnIndex.has(q)) return [vnIndex.get(q)!]
  if (vnIndex.has(q + '.vn')) return [vnIndex.get(q + '.vn')!]

  const results: StockCatalogEntry[] = []
  for (const s of VN_STOCKS) {
    const score =
      (s.code.toLowerCase().startsWith(q) ? 10 : 0) +
      (s.name.toLowerCase().includes(q) ? 5 : 0) +
      (s.nameVi.toLowerCase().includes(q) ? 5 : 0) +
      (s.sector.toLowerCase().includes(q) ? 2 : 0) +
      (s.sectorVi.toLowerCase().includes(q) ? 2 : 0)
    if (score > 0) results.push(s)
  }

  return results
    .sort((a, b) => {
      const sa = (a.code.toLowerCase().startsWith(q) ? 100 : 0) + (a.nameVi.toLowerCase().includes(q) ? 50 : 0)
      const sb = (b.code.toLowerCase().startsWith(q) ? 100 : 0) + (b.nameVi.toLowerCase().includes(q) ? 50 : 0)
      return sb - sa
    })
    .slice(0, 15)
}

export function resolveVNSymbol(input: string | null | undefined): string | null {
  if (!input || typeof input !== 'string') return null
  const q = input.trim().toUpperCase()
  if (!q) return null
  if (q.endsWith('.VN')) return q
  const entry = vnIndex.get(q.toLowerCase())
  return entry ? entry.symbol : null
}

export function getVNStock(symbol: string): StockCatalogEntry | undefined {
  return VN_STOCKS.find((s) => s.symbol === symbol || s.code === symbol)
}