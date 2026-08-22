package com.globetrotter.service;

import com.globetrotter.dto.CityDTO;
import com.globetrotter.model.City;
import com.globetrotter.repository.CityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CityService {

    private final CityRepository cityRepository;

    @Autowired
    public CityService(CityRepository cityRepository) {
        this.cityRepository = cityRepository;
    }

    @Transactional(readOnly = true)
    public List<CityDTO> getAllCities() {
        return cityRepository.findByOrderByPopularityDesc()
                .stream()
                .map(CityDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CityDTO getCityById(Long id) {
        City city = cityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("City not found with id: " + id));
        return CityDTO.fromEntity(city);
    }

    @Transactional(readOnly = true)
    public List<CityDTO> searchCities(String query) {
        if (query == null || query.isBlank()) {
            return getAllCities();
        }
        return cityRepository.searchCities(query.trim())
                .stream()
                .map(CityDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
