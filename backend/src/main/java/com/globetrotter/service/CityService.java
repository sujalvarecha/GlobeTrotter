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
    public List<CityDTO> searchCities(String query, String region, Double maxCostIndex, Integer minPopularity) {
        List<City> baseList;
        if (query == null || query.isBlank()) {
            baseList = cityRepository.findByOrderByPopularityDesc();
        } else {
            baseList = cityRepository.searchCities(query.trim());
        }

        return baseList.stream()
                .filter(c -> {
                    if (region != null && !region.isBlank()) {
                        if (c.getRegion() == null || !c.getRegion().equalsIgnoreCase(region.trim())) {
                            return false;
                        }
                    }
                    if (maxCostIndex != null) {
                        if (c.getCostIndex() != null && c.getCostIndex() > maxCostIndex) {
                            return false;
                        }
                    }
                    if (minPopularity != null) {
                        if (c.getPopularity() != null && c.getPopularity() < minPopularity) {
                            return false;
                        }
                    }
                    return true;
                })
                .map(CityDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
