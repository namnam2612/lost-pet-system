package com.petfinder.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.petfinder.backend.dto.blog.CreateBlogRequest;
import com.petfinder.backend.entity.Blog;
import com.petfinder.backend.repository.BlogRepository;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class BlogControllerTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper mapper;

    @Autowired
    private BlogRepository blogRepository;

    @Autowired
    private com.petfinder.backend.repository.UserRepository userRepository;

    @Test
    void createUpdateDeleteBlog() throws Exception {
        CreateBlogRequest req = new CreateBlogRequest();
        req.setBlogType(com.petfinder.backend.entity.enums.BlogType.LOST);
        req.setPetType("DOG");
        req.setDescription("Test blog");
        req.setProvince("Hanoi");

        String json = mapper.writeValueAsString(req);

        // create
        mvc.perform(post("/api/blogs").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.blogId").exists());

        // fetch created
        Blog created = blogRepository.findAll().stream().filter(b -> b.getPet() != null && "Test blog".equals(b.getPet().getDescription())).findFirst().orElseThrow();
        final Long createdId = created.getBlogId();

        // update
        mvc.perform(put("/api/blogs/" + createdId).contentType(MediaType.APPLICATION_JSON).content("{\"description\":\"Updated\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pet.description").value("Updated"));

        // delete
        mvc.perform(delete("/api/blogs/" + createdId))
                .andExpect(status().isNoContent());

        Assertions.assertFalse(blogRepository.findById(createdId).isPresent());
    }

    @Test
    void blogDetailIncludesUser() throws Exception {
        com.petfinder.backend.entity.User u = new com.petfinder.backend.entity.User();
        u.setName("Tester");
        u.setEmail("tester" + System.currentTimeMillis() + "@example.com");
        u.setPassword("pass");
        u.setPhone("0123456789");
        u = userRepository.save(u);

        CreateBlogRequest req = new CreateBlogRequest();
        req.setBlogType(com.petfinder.backend.entity.enums.BlogType.LOST);
        req.setPetType("CAT");
        req.setDescription("With user");
        req.setProvince("Hanoi");
        req.setUserId(u.getId());

        String json = mapper.writeValueAsString(req);

        mvc.perform(post("/api/blogs").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.blogId").exists());

        Blog created = blogRepository.findAll().stream().filter(b -> b.getPet() != null && "With user".equals(b.getPet().getDescription())).findFirst().orElseThrow();
        mvc.perform(get("/api/blogs/" + created.getBlogId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user").exists())
                .andExpect(jsonPath("$.user.name").value("Tester"))
                .andExpect(jsonPath("$.user.phone").value("0123456789"))
                .andExpect(jsonPath("$.user.email").value(u.getEmail()))
                .andExpect(jsonPath("$.user.role").value(u.getRole()));
    }

        @Test
        void updateBlogWithoutPetShouldNotThrow() throws Exception {
                // create a bare blog without pet/location
                Blog b = new Blog();
                b.setTitle("Bare blog");
        b.setBlogType(com.petfinder.backend.entity.enums.BlogType.LOST); // satisfy not-null constraint
        Blog saved = blogRepository.save(b);
                // update should create pet/location as needed and not throw 500
                mvc.perform(put("/api/blogs/" + saved.getBlogId()).contentType(MediaType.APPLICATION_JSON).content("{\"description\":\"Added desc\", \"status\":\"FOUND\"}"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.pet.description").value("Added desc"))
                                .andExpect(jsonPath("$.blogStatus").value("FOUND"));

                // cleanup
                blogRepository.deleteById(saved.getBlogId());
        }
}
