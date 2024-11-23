import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { TextField, Box, Button, FormControl, InputLabel, Select, MenuItem, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Contexts from '../configs/Contexts';
import debounce from 'lodash.debounce';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { vi } from 'date-fns/locale';
import { format } from 'date-fns';
import shadows from '@mui/material/styles/shadows';

const Home = () => {
  const [filters, setFilters] = useState({
    q: '',
    routeId: '',
    selectedDate: null,
  });
  const [bustrips, setBustrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [userState] = useContext(Contexts);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const pageSize = 10;
  const token = localStorage.getItem('access-token');

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(totalCount / pageSize));
    if (page > maxPage && maxPage > 0) {
      setPage(maxPage);
    }
  }, [totalCount, page]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1)
  };

  const handleInputChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    if (key !== 'q') setPage(1);
  };

  const debouncedSearch = useCallback(
    debounce((query) => {
      setFilters((prev) => ({
        ...prev,
        q: query,
      }));
      setPage(1);
    }, 300),
    []
  );

  const loadRoutes = async () => {
    try {
      let res = await axios.get('https://tltk.pythonanywhere.com/routes/');
      setRoutes(res.data);
    } catch (ex) {
      console.error(ex);
      setError('Không thể tải tuyến đi. Vui lòng thử lại sau.');
    }
  };

  const loadTrips = async () => {
    if (!loading) {
      const formattedDate = filters.selectedDate
        ? format(filters.selectedDate, 'yyyy-MM-dd')
        : '';
      const url = `https://tltk.pythonanywhere.com/bustrips/?q=${filters.q}&route_id=${filters.routeId}&page=${page}&start_time=${formattedDate}`;
      try {
        setLoading(true);
        const res = await axios.get(url);
        let loadedTrips = res.data.results;

        if (userState.user.user.role === 'student') {
          loadedTrips = loadedTrips.filter((trip) => trip.trip_status === 'ready');
        }

        setBustrips(loadedTrips);
        setTotalCount(
          userState.user.user.role === 'student' ? loadedTrips.length : res.data.count
        );
      } catch (ex) {
        console.error(ex);
        setError('Không thể tải chuyến đi. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  useEffect(() => {
    loadTrips();
  }, [filters.q, filters.routeId, filters.selectedDate, page]);

  const handleDeleteTrip = async (tripId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chuyến xe này?")) {
        try {
            const token = localStorage.getItem('access-token');
            await axios.delete(`https://tltk.pythonanywhere.com/bustrips/${tripId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            alert('Chuyến xe đã được xóa thành công!');
            setBustrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
        } catch (error) {
            console.error('Lỗi khi xóa chuyến xe:', error);
            alert('Có lỗi xảy ra khi xóa chuyến xe!');
        }
    }
  };
  return token ? (
    <Box style={{ margin: 10 }}>
      <Box style={{ backgroundColor:'rgb(253 248 230)', padding:'10px', marginBottom: 10 }}>
        <Box mt={5} textAlign="center">
          <Typography variant="h4" color="#02053a" fontWeight="bold">
            ĐẶT VÉ XE OU BUS
          </Typography>
        </Box>
        <Box mt={2} style={{ display: 'flex' }}>
          <TextField
            label="Tìm kiếm chuyến xe...."
            variant="outlined"
            sx={{ marginBottom: 2, width: '40%' }}
            onChange={(e) => debouncedSearch(e.target.value)}
          />
          <div style={{ marginLeft: 20, marginRight: 20 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
              <DatePicker
                label="Chọn ngày đi"
                value={filters.selectedDate}
                onChange={(newValue) => handleInputChange('selectedDate', newValue)}
                inputFormat="dd/MM/yyyy"
                renderInput={(params) => <TextField {...params} sx={{ flex: 1 }} />}
              />
            </LocalizationProvider>
          </div>
          <FormControl style={{ marginRight: 10, width: '35%' }}>
            <InputLabel id="route-select-label">Chọn Tuyến Xe</InputLabel>
            <Select
              labelId="route-select-label"
              value={filters.routeId}
              onChange={(e) => handleInputChange('routeId', e.target.value)}
              label="Chọn Tuyến Xe"
            >
              {routes.map((route) => (
                <MenuItem key={route.id} value={route.id}>
                  {route.route_code}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

    
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: 'bold' }}>Điểm Xuất Phát</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>Điểm Đến</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>Giờ Xuất Phát</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>Ngày đi</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bustrips.map((trip) => (
              <>
                {userState.user.user.role === 'staff' && (
                  <TableRow key={trip.id} onClick={() => navigate(`/bustrips/${trip.id}`)}>
                      <TableCell>{trip.route.starting_point.name}</TableCell>
                      <TableCell>{trip.route.ending_point.name}</TableCell>
                      <TableCell>{format(new Date(trip.start_time), 'HH:mm')}</TableCell>
                      <TableCell>{format(new Date(trip.start_time), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{trip.trip_status}</TableCell>
                      <TableCell>
                        <Button style={{ backgroundColor: 'yellow', marginRight: 5}} onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/edit-trip/${trip.id}`)
                        }}>Chỉnh sửa</Button>
                        <Button style={{ backgroundColor: 'red'}} onClick={(e) => { 
                            e.stopPropagation();
                            handleDeleteTrip(trip.id);
                        }}>Xóa</Button>
                      </TableCell>
                  </TableRow>
                )}
                {userState.user.user.role === 'student' && trip.trip_status === 'ready' && (
                  <TableRow key={trip.id} onClick={() => navigate(`/bustrips/${trip.id}`)}>
                      <TableCell>{trip.route.starting_point.name}</TableCell>
                      <TableCell>{trip.route.ending_point.name}</TableCell>
                      <TableCell>{format(new Date(trip.start_time), 'HH:mm')}</TableCell>
                      <TableCell>{format(new Date(trip.start_time), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{trip.trip_status}</TableCell>
                  </TableRow>
                )}
              </>
                  ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount}
        page={page - 1} 
        onPageChange={(event, newPage) => handleChangePage(event, newPage)}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[]}
      />
    </Box>
  ) : (
    navigate('/login/')
  );
};

export default Home;



